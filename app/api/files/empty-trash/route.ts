import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

// Recursive function to get all nested files/folders inside a folder
async function getAllNestedFiles(folderId: string, userId: string) {
  const result: typeof files.$inferSelect[] = [];

  const stack: string[] = [folderId];

  while (stack.length > 0) {
    const currentFolderId = stack.pop()!;
    const children = await db
      .select()
      .from(files)
      .where(and(eq(files.parentId, currentFolderId), eq(files.userId, userId)));

    for (const item of children) {
      result.push(item);
      if (item.isFolder) {
        stack.push(item.id); // Recurse into subfolder
      }
    }
  }

  return result;
}

// Delete a single file from ImageKit (not folder)
async function deleteFileFromImageKit(file: typeof files.$inferSelect) {
  try {
    let imagekitFileId = null;

    if (file.fileUrl) {
      const urlWithoutQuery = file.fileUrl.split("?")[0];
      imagekitFileId = urlWithoutQuery.split("/").pop();
    }

    if (!imagekitFileId && file.path) {
      imagekitFileId = file.path.split("/").pop();
    }

    if (imagekitFileId) {
      try {
        const searchResults = await imagekit.listFiles({
          name: imagekitFileId,
          limit: 1,
        });

        if (searchResults && searchResults.length > 0) {
          console.log("Search result file")
          await imagekit.deleteFile(searchResults[0].fileId);
        } else {
          console.log("folder")
          await imagekit.deleteFile(imagekitFileId);
        }
      } catch (searchError) {
        console.error("Error searching in ImageKit:", searchError);
        await imagekit.deleteFile(imagekitFileId);
      }
    }
  } catch (error) {
    console.error(`Error deleting file ${file.id} from ImageKit:`, error);
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all trashed files and folders
    const trashedItems = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    const allToDelete: typeof files.$inferSelect[] = [...trashedItems];

    // For each trashed folder, get nested children recursively
    for (const item of trashedItems) {
      if (item.isFolder) {
        const nested = await getAllNestedFiles(item.id, userId);
        allToDelete.push(...nested);
      }
    }

    // Remove duplicates if any (due to recursive traversal)
    const fileMap = new Map<string, typeof files.$inferSelect>();
    for (const file of allToDelete) {
      fileMap.set(file.id, file);
    }

    const finalFiles = Array.from(fileMap.values());

    // Delete non-folder files from ImageKit
    const deleteFromImageKit = finalFiles
      .filter((f) => !f.isFolder)
      .map((f) => deleteFileFromImageKit(f));

    await Promise.allSettled(deleteFromImageKit);

    // Delete all files and folders from DB
    const deleted = await db
      .delete(files)
      .where(
        and(
          eq(files.userId, userId),
          or(...finalFiles.map((f) => eq(files.id, f.id)))
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.length} items (including nested) from trash.`,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
