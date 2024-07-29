from .graphrag import GraphRAGAgent

def create_agent(agent_type):
    if agent_type == 'graphrag':
        return GraphRAGAgent()
    # 在这里添加其他 agent 类型
    else:
        raise ValueError(f"Unknown agent type: {agent_type}")
