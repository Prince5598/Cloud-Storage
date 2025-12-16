import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

// Recursive deletion helper
async function deleteFileAndChildren(fileId: string, userId: string) {
  console.log("file id",fileId);
  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId)));

  if (!file) return;

  if (file.isFolder) {
    const children = await db
      .select()
      .from(files)
      .where(and(eq(files.parentId, fileId), eq(files.userId, userId)));

    for (const child of children) {
      await deleteFileAndChildren(child.id, userId);
    }
  } else {
    // Delete file from ImageKit
    try {
      let imagekitFileId: string | null = null;

      if (file.fileUrl) {
        const urlWithoutQuery = file.fileUrl.split("?")[0];
        imagekitFileId = urlWithoutQuery.split("/").pop() || null;
      }

      if (!imagekitFileId && file.path) {
        imagekitFileId = file.path.split("/").pop() || null;
      }

      if (imagekitFileId) {
  try {
    const searchResults = await imagekit.listFiles({
      name: imagekitFileId,
      limit: 1,
    });

    const result = searchResults[0];

    if (result && "fileId" in result) {
      await imagekit.deleteFile(result.fileId);
      console.log("image deleted using searchResult!");
    } else {
      await imagekit.deleteFile(imagekitFileId);
      console.log("Image deleted using imagekitFileId!");
    }

  } catch (searchError) {
    console.error("ImageKit search failed:", searchError);
    await imagekit.deleteFile(imagekitFileId);
  }
}

    } catch (error) {
      console.error("Failed to delete from ImageKit:", error);
    }
  }

  // Delete from database
  await db
    .delete(files)
    .where(and(eq(files.id, fileId), eq(files.userId, userId)));
}

// DELETE route handler
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json({ error: "FileId is required" }, { status: 400 });
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await deleteFileAndChildren(fileId, userId);

    return NextResponse.json({
      success: true,
      message: file.isFolder
        ? "Folder and its contents deleted successfully"
        : "File deleted successfully",
      deletedId: fileId,
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
