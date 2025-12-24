import { db } from "@/db";
import { type NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { productId } = body;
    if (!productId) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    const dbResponse = await db.fetch([productId], {
      includeVectors: true,
      includeMetadata: true,
    });
    const product = dbResponse[0];
    if (!product) {
      return Response.json({ error: "not found" }, { status: 404 });
    }

    const relatedProducts = (await db.query({
      topK: 4,
      vector: product?.vector ?? [0, 0, 0],
      includeMetadata: true,
    })).slice(1);
    return Response.json({ product, relatedProducts, error: null });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "internal server error", error: error }),
      {
        status: 500,
      }
    );
  }
};
