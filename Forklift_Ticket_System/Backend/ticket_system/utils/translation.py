# # utils/translate.py
# from googletrans import Translator
# from django.core.cache import cache

# translator = Translator()

# def translate_text(text, target_language, source_language="en"):
#     cache_key = f"translation:{text}:{source_language}:{target_language}"
#     cached_translation = cache.get(cache_key)
    
#     if cached_translation:
#         return cached_translation
    
#     try:
#         translated = translator.translate(text, src=source_language, dest=target_language)
#         translated_text = translated.text
#         # print(f"Translated text: {text} -> {translated_text}")
        
#         # Cache the translation for reuse
#         cache.set(cache_key, translated_text, timeout=3600)  # Cache for 1 hour
#         return translated_text
#     except Exception as e:
#         print(f"Error in translation: {e}")
#         return text




# def translate_dict(data, target_language, source_language="en"):
#     print(f"target_language: {target_language}")

#     # if target_language == source_language == "en":
#     #     return data

#     if not isinstance(data, (dict, list)):
#         return translate_text(data, target_language, source_language) if isinstance(data, str) else data

#     if isinstance(data, list):
#         translated_list = [
#             translate_dict(item, target_language, source_language) if isinstance(item, (dict, list)) else translate_text(item, target_language, source_language)
#             for item in data
#         ]
#         return translated_list

#     translated_data = {}
#     for key, value in data.items():
#         if isinstance(value, (dict, list)):
#             translated_data[key] = translate_dict(value, target_language, source_language)
#         elif isinstance(value, str):
#             translated_data[key] = translate_text(value, target_language, source_language)
#         else:
#             translated_data[key] = value  # Non-string fields are not translated

#     return translated_data



# utils/translate.py
from googletrans import Translator
from django.core.cache import cache

translator = Translator()


def translate_text(text, target_language, source_language="en"):
    if target_language == source_language:
        return text  # No translation needed

    cache_key = f"translation:{text}:{source_language}:{target_language}"
    cached_translation = cache.get(cache_key)

    if cached_translation:
        return cached_translation

    try:
        translated = translator.translate(text, src=source_language, dest=target_language)
        translated_text = translated.text
        cache.set(cache_key, translated_text, timeout=3600)  # Cache for 1 hour
        return translated_text
    except Exception as e:
        print(f"Error in translation: {e}")
        return text


def batch_translate_texts(texts, target_language, source_language="en"):
    if target_language == source_language:
        return texts  # No translation needed

    results = []
    uncached_texts = []
    cached_results = {}
    uncached_indices = []

    # Check cache
    for i, text in enumerate(texts):
        cache_key = f"translation:{text}:{source_language}:{target_language}"
        cached = cache.get(cache_key)
        if cached:
            cached_results[i] = cached
        else:
            uncached_texts.append(text)
            uncached_indices.append(i)

    # Translate only uncached texts
    if uncached_texts:
        try:
            translated = translator.translate(uncached_texts, src=source_language, dest=target_language)
            translated_texts = [t.text for t in translated]

            for i, translated_text in zip(uncached_indices, translated_texts):
                cache_key = f"translation:{texts[i]}:{source_language}:{target_language}"
                cache.set(cache_key, translated_text, timeout=3600)
                cached_results[i] = translated_text
        except Exception as e:
            print(f"Error in batch translation: {e}")
            # Fallback to original text
            for i in uncached_indices:
                cached_results[i] = texts[i]

    # Reconstruct result list in original order
    results = [cached_results[i] for i in range(len(texts))]
    return results


def extract_strings(data):
    flat_strings = []
    paths = []

    def recurse(current, path=[]):
        if isinstance(current, dict):
            for key, value in current.items():
                recurse(value, path + [key])
        elif isinstance(current, list):
            for idx, item in enumerate(current):
                recurse(item, path + [idx])
        elif isinstance(current, str):
            flat_strings.append(current)
            paths.append(path)

    recurse(data)
    return flat_strings, paths


def insert_strings(template, paths, translated_texts):
    def set_path(obj, path, value):
        for key in path[:-1]:
            obj = obj[key]
        obj[path[-1]] = value

    for path, value in zip(paths, translated_texts):
        set_path(template, path, value)

    return template


def translate_dict(data, target_language, source_language="en"):
    if target_language == source_language:
        return data  # No translation needed

    if not isinstance(data, (dict, list)):
        return translate_text(data, target_language, source_language) if isinstance(data, str) else data

    flat_strings, paths = extract_strings(data)
    if not flat_strings:
        return data

    translated_texts = batch_translate_texts(flat_strings, target_language, source_language)
    return insert_strings(data, paths, translated_texts)
