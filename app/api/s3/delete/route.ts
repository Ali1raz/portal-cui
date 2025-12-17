import { requireSession } from "@/app/data/session/require-session";
import { s3 } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  await requireSession();
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Missing or invalid object key provided" },
        { status: 400 }
      );
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(deleteCommand);
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Missing or invalid object key provided" },
      { status: 500 }
    );
  }
}
