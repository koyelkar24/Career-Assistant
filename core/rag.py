"""Optional Chroma-backed document retrieval helpers."""

from __future__ import annotations


def get_collection(path: str = "./.chroma", name: str = "career_assistant"):
    try:
        import chromadb
    except ImportError as exc:
        raise RuntimeError("Install chromadb to enable retrieval.") from exc
    return chromadb.PersistentClient(path=path).get_or_create_collection(name=name)


def add_documents(collection, documents: list[str], ids: list[str], metadata: list[dict] | None = None) -> None:
    collection.upsert(documents=documents, ids=ids, metadatas=metadata)


def search(collection, query: str, n_results: int = 5) -> list[str]:
    return collection.query(query_texts=[query], n_results=n_results).get("documents", [[]])[0]
