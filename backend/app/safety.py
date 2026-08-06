OFFENSIVE_WORDS = [
    "idiot",
    "idioata",
    "prost",
    "proasta",
    "stupid",
    "stupida",
    "imbecil",
    "imbecila",
    "cretin",
    "cretina",
    "terminat",
    "terminata",
    "tampit",
    "tampita"
]


PUNCTUATION_CHARACTERS = [
    ".",
    ",",
    "!",
    "?",
    ";",
    ":",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "\"",
    "'",
    "-",
    "_",
    "/",
    "\\",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "+",
    "=",
    "„",
    "”"
]


def contains_inappropriate_language(message):
   

    if message is None:
        return False

    normalized_message = message.lower()

   # Convert the message to lowercase and remove punctuation characters.
    for punctuation_character in PUNCTUATION_CHARACTERS:
        normalized_message = normalized_message.replace(
            punctuation_character,
            " "
        )

    message_words = normalized_message.split()

    for message_word in message_words:

        if message_word in OFFENSIVE_WORDS:
            return True

    return False