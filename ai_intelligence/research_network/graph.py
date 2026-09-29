import networkx as nx
class ResearchGraph:
    def __init__(self): self.g=nx.MultiDiGraph()
    def add_node(self,node_id,node_type,**attrs): self.g.add_node(node_id,type=node_type,**attrs)
    def add_edge(self,source,target,relation,provenance):
        if not provenance: raise ValueError("Every relationship requires provenance")
        self.g.add_edge(source,target,relation=relation,provenance=provenance)
    def neighbors(self,node_id): return list(self.g.successors(node_id))
