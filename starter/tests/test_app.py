from app import app


def test_index_route_returns_200():
    client = app.test_client()
    response = client.get("/")
    html = response.get_data(as_text=True)

    assert response.status_code == 200
    assert 'id="theme-toggle"' in html
    assert 'value="easy"' in html
    assert 'value="medium"' in html
    assert 'value="hard"' in html
    assert 'Easy' in html
    assert 'Medium' in html
    assert 'Hard' in html
    assert 'id="hints-used"' in html
