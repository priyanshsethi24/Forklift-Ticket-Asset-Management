class LanguageMiddleware:
    """
    Middleware to fetch source and target languages from session and add them to the request.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Set default languages if not already in the session
        request.source_language = request.session.get('source_language', 'en')
        request.target_language = request.session.get('target_language', 'en')

        # Proceed with the response
        response = self.get_response(request)
        return response
