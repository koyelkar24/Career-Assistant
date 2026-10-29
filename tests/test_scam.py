from core.scam_detector import analyze_job


def test_flags_upfront_payment():
    result = analyze_job("Pay a fee for training and send payment by gift card")
    assert result["risk_level"] == "high"
    assert result["flags"]
