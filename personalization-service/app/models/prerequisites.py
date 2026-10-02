import networkx as nx
from typing import Dict, List, Set

SWE_PREREQUISITES: Dict[str, List[str]] = {
    "Arrays and Strings": ["Programming Fundamentals"],
    "Two Pointers": ["Arrays and Strings"],
    "Sliding Window": ["Two Pointers", "Hash Maps"],
    "Hash Maps": ["Arrays and Strings"],
    "Linked Lists": ["Programming Fundamentals"],
    "Stacks": ["Arrays and Strings"],
    "Queues": ["Arrays and Strings"],
    "Binary Search": ["Arrays and Strings"],
    "Trees": ["Linked Lists", "Recursion"],
    "Binary Search Trees": ["Trees"],
    "Graphs": ["Trees", "Queues"],
    "Dynamic Programming": ["Recursion", "Arrays and Strings"],
    "OOP": ["Programming Fundamentals"],
    "REST APIs": ["Programming Fundamentals", "HTTP"],
    "Backend Development": ["OOP", "REST APIs"],
    "Testing": ["Programming Fundamentals"],
    "Docker": ["Git"],
    "CI/CD": ["Docker", "Git"],
    "DBMS": ["Database Fundamentals"],
    "SQL": ["DBMS"],
    "Database Indexing": ["SQL", "DBMS"],
    "Computer Networks": [],
    "HTTP": ["Computer Networks"],
    "Operating Systems": [],
    "System Design": ["Backend Development", "DBMS", "Computer Networks"],
    "Caching": ["System Design", "DBMS"],
    "Load Balancing": ["System Design", "Computer Networks"],
    "Microservices": ["Backend Development", "REST APIs", "Docker"],
    "Scalability": ["Caching", "Load Balancing"]
}

BA_PREREQUISITES: Dict[str, List[str]] = {
    "Data Analysis": [],
    "Microsoft Excel": ["Data Analysis"],
    "SQL": ["Data Analysis"],
    "Power BI": ["Data Analysis", "Microsoft Excel"],
    "Tableau": ["Data Analysis"],
    "Data Visualization": ["Power BI"],
    "Statistics": ["Data Analysis"],
    "Agile": [],
    "Scrum": ["Agile"],
    "User Stories": ["Agile"],
    "Requirements Gathering": ["Agile"],
    "BPMN": ["Requirements Gathering"],
    "UAT": ["Requirements Gathering", "User Stories"],
    "Stakeholder Management": ["Requirements Gathering"],
    "Gap Analysis": ["Requirements Gathering", "Data Analysis"],
    "KPI Development": ["Data Analysis", "Power BI"]
}

def get_prerequisite_graph(role_track: str) -> nx.DiGraph:
    """Constructs a directed acyclic graph (DAG) of skill prerequisites."""
    G = nx.DiGraph()
    prereqs = SWE_PREREQUISITES if "software" in role_track.lower() else BA_PREREQUISITES

    for skill, deps in prereqs.items():
        G.add_node(skill)
        for dep in deps:
            G.add_edge(dep, skill)  # dep must come before skill

    return G

def get_topological_skill_order(role_track: str, skills_subset: List[str] = None) -> List[str]:
    """Returns a deterministic sequence of skills that respects all prerequisite constraints."""
    G = get_prerequisite_graph(role_track)
    try:
        full_order = list(nx.topological_sort(G))
    except nx.NetworkXUnfeasible:
        full_order = list(G.nodes())

    if not skills_subset:
        return full_order

    skills_set = set(skills_subset)
    # Return topological order filtered to only the requested subset, plus any missing requested skills
    ordered = [s for s in full_order if s in skills_set]
    for s in skills_subset:
        if s not in ordered:
            ordered.append(s)
    return ordered

def get_unmet_prerequisites(role_track: str, skill: str, current_mastery: Dict[str, float]) -> List[str]:
    """Identifies any prerequisite skills where the learner has < 30 mastery."""
    prereqs = SWE_PREREQUISITES if "software" in role_track.lower() else BA_PREREQUISITES
    deps = prereqs.get(skill, [])
    unmet = []
    for dep in deps:
        if current_mastery.get(dep, 0.0) < 30.0:
            unmet.append(dep)
    return unmet
