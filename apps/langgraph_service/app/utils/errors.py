class GraphNodeError(Exception):
    def __init__(self, node: str, message: str, original_error: Exception | None = None):
        self.node = node
        self.message = message
        self.original_error = original_error
        super().__init__(f"[{node}] {message}")


class LLMFallbackExhaustedError(Exception):
    pass


class CheckpointConnectionError(Exception):
    pass