from googletrans import Translator
from django.core.cache import cache
translator = Translator()

def translate_text(text, target_language='de'):
    """
    Translate the given text to the specified target language using Google Translate.

    Args:
        text (str): The text to translate.
        target_language (str): The language code for translation (e.g., 'de' for German).

    Returns:
        str: The translated text.
    """
    print("textt", text)
    translator = Translator()
    try:
        # Translate text to the target language
        translated = translator.translate(text, dest=target_language)
        print("translated", translated.text)
        return translated.text
    except Exception as e:
        print(f"Error during translation: {e}")
        return text  # Return the original text if translation fails
    



def translate_dict(data, target_language, source_language="en"):

    if target_language == source_language == "en":
        return data

    if not isinstance(data, (dict, list)):
        return translate_text(data, target_language, source_language) if isinstance(data, str) else data

    if isinstance(data, list):
        translated_list = [
            translate_dict(item, target_language, source_language) if isinstance(item, (dict, list)) else translate_text(item, target_language, source_language)
            for item in data
        ]
        return translated_list

    translated_data = {}
    for key, value in data.items():
        if isinstance(value, (dict, list)):
            translated_data[key] = translate_dict(value, target_language, source_language)
        elif isinstance(value, str):
            translated_data[key] = translate_text(value, target_language, source_language)
        else:
            translated_data[key] = value  # Non-string fields are not translated

    return translated_data



def translate_text(text, target_language, source_language="en"):
    cache_key = f"translation:{text}:{source_language}:{target_language}"
    cached_translation = cache.get(cache_key)
    
    if cached_translation:
        return cached_translation
    
    try:
        translated = translator.translate(text, src=source_language, dest=target_language)
        translated_text = translated.text
        
        # Cache the translation for reuse
        cache.set(cache_key, translated_text, timeout=3600)  # Cache for 1 hour
        return translated_text
    except Exception as e:
        print(f"Error in translation: {e}")
        return text


