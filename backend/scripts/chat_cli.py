from backend.app.tool_chat import recommend_book_with_summary


EXIT_COMMANDS = [
    "exit",
    "quit",
    "iesire"
]


def main():
    print("========================================")
    print("SMART LIBRARIAN")
    print("========================================")
    print()
    print("Descrie ce fel de carte cauti.")
    print("Exemplu:")
    print("Vreau o carte despre prietenie si magie.")
    print()
    print("Pentru a inchide aplicatia, scrie:")
    print("exit")
    print()

    while True:
        print("----------------------------------------")

        user_question = input(
            "Tu: "
        )

        cleaned_question = user_question.strip()

        # Verificam daca utilizatorul vrea
        # sa inchida aplicatia.
        if cleaned_question.lower() in EXIT_COMMANDS:
            print()
            print("Smart Librarian a fost inchis.")
            break

        # Nu trimitem un mesaj gol mai departe.
        if cleaned_question == "":
            print()
            print(
                "Smart Librarian: "
                "Te rog sa introduci o intrebare."
            )
            print()

            continue

        print()
        print("Smart Librarian proceseaza cererea...")
        print()

        answer = recommend_book_with_summary(
            user_question=cleaned_question
        )

        print()
        print("SMART LIBRARIAN:")
        print()
        print(answer)
        print()


if __name__ == "__main__":
    main()