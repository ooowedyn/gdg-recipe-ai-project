"""기존 3개 에이전트(agent.py)를 import 가능한 형태로 로드한다.

세 에이전트가 모두 최상위 이름 prompt / utils 를 import 하기 때문에
한 프로세스에서 그냥 올리면 sys.modules 캐시가 충돌한다.
로드 직전에 그 캐시를 비우고 해당 폴더를 sys.path 맨 앞에 둬서
각 에이전트가 자기 폴더의 prompt / utils 를 쓰도록 격리한다.

ingredient / visual 의 agent.py 는 import 시점에 OpenAI 클라이언트를
초기화하므로(키 필요), mock 모드에서는 이 로더를 호출하지 않는다.
모듈은 처음 한 번만 로드해 캐시한다.
"""

import sys
import importlib.util

from .config import settings

_cache = {}


def _load(agent_dir, key):
    if key in _cache:
        return _cache[key]

    for name in ("prompt", "utils"):
        sys.modules.pop(name, None)

    agent_dir = str(agent_dir)
    sys.path.insert(0, agent_dir)
    try:
        spec = importlib.util.spec_from_file_location(
            "agent_" + key, f"{agent_dir}/agent.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    finally:
        sys.path.remove(agent_dir)

    _cache[key] = module
    return module


def ingredient():
    return _load(settings.INGREDIENT_DIR, "ingredient")


def recipe():
    return _load(settings.RECIPE_DIR, "recipe")


def visual():
    return _load(settings.VISUAL_DIR, "visual")
