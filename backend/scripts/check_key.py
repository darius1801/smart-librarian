import os


def main():
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print("Cheia OpenAI nu a fost gasita in variabilele de mediu.")
        print("Seteaza cheia in PowerShell si redeschide terminalul.")
        return

    print("Cheia OpenAI a fost gasita.")
    print("Nu afisam cheia pentru a proteja securitatea acesteia.")


if __name__ == "__main__":
    main()