from backend.app.safety import contains_inappropriate_language


def main():
    test_messages = [
        "Vreau o carte despre magie.",
        "Ce carte imi recomanzi despre razboi?",
        "Esti un idiot!",
        "Aceasta este o intrebare stupida.",
        "Vreau sa citesc 1984."
    ]

    print("Testam filtrul de limbaj.")
    print()

    for message in test_messages:
        is_blocked = contains_inappropriate_language(
            message
        )

        print(message)

        if is_blocked is True:
            print("Rezultat: BLOCAT")
        else:
            print("Rezultat: PERMIS")

        print()


if __name__ == "__main__":
    main()