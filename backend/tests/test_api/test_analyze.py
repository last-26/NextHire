import pytest


@pytest.mark.asyncio
async def test_analyze_endpoint_requires_file(client):
    """Test that analyze endpoint requires a CV file."""
    response = await client.post("/api/v1/analyze")
    assert response.status_code == 422
