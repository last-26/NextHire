"""Model registry, pricing info, and task-to-model mappings."""

PRICING = {
    # AWS Bedrock pricing (per 1M tokens)
    "eu.anthropic.claude-haiku-4-5-20251001-v1:0": {
        "input_per_1m": 0.80,
        "output_per_1m": 4.00,
    },
    "eu.anthropic.claude-sonnet-4-20250514-v1:0": {
        "input_per_1m": 3.00,
        "output_per_1m": 15.00,
    },
}

# Task type to model tier mapping
TASK_MODEL_MAP: dict[str, str] = {
    "parse_job": "fast",
    "parse_cv": "fast",
    "keyword_extract": "fast",
    "analyze_match": "power",
    "identify_gaps": "power",
    "generate_cover_letter": "power",
    "reflect": "power",
}
