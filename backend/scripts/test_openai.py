import os

from openai import OpenAI


def main():
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print("Eroare: cheia OpenAI nu a fost gasita.")
        return

    client = OpenAI()

    text = "Vreau o carte despre prietenie, magie si aventura."

    print("Trimitem textul catre modelul de embeddings...")

    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    embedding = response.data[0].embedding

    print("Requestul a functionat.")
    print("Text trimis:")
    print(text)

    print()
    print("Numarul de valori din embedding:")
    print(len(embedding))

    print()
    print("Primele 5 valori:")
    print(embedding[:5])


if __name__ == "__main__":
    main()