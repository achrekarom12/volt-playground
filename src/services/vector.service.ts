import { ChromaClient, Collection } from "chromadb";

export const client = new ChromaClient();

export async function ping() {
    console.log(await client.heartbeat());
}

export async function getOrCreateCollection(collectionName: string, description: string) {
    return await client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: null,
        metadata: {
            description: description,
            created: new Date().toString(),
        },
    });
}

export async function deleteCollection(collectionName: string) {
    await client.deleteCollection({
        name: collectionName,
    });
}

export async function addData(collection: Collection, data: { id: string, embedding: number[], document: string, metadata: any }[]) {
    await collection.add({
        ids: data.map(d => d.id),
        embeddings: data.map(d => d.embedding),
        documents: data.map(d => d.document),
        metadatas: data.map(d => d.metadata),
    })
}

export async function getCollectionDetails(collectionName: string) {
    const collection = await client.getCollection({
        name: collectionName,
    });
    console.log(collection);
}
