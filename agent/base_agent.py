class BaseAgent:
    def __init__(self):
        pass

    def chat(self, query):
        raise NotImplementedError("Subclasses must implement this method")
