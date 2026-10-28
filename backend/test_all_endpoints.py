import io
import sys
from PIL import Image
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== TrustLens AI Comprehensive Verification (Gemini Engine) ===")
    passed = 0
    total = 0

    def assert_test(cond, title):
        nonlocal passed, total
        total += 1
        if cond:
            print(f"  [PASS] Test {total}: {title}")
            passed += 1
        else:
            print(f"  [FAIL] Test {total}: {title}")

    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Health endpoint
    res = client.get("/api/health")
    data = res.json()
    assert_test(res.status_code == 200 and data.get("status") in ("ok", "healthy"), "Backend /api/health endpoint")

    # 2. Scam Empty Input
    res = client.post("/api/analyze/scam", json={"content": "   "})
    assert_test(res.status_code == 400, "Scam empty input rejected with 400")

    # 3. Scam Normal message
    res = client.post("/api/analyze/scam", json={"content": "Hey team, looking forward to our project catch-up meeting at 3 PM today."})
    data = res.json()
    assert_test(res.status_code == 200 and data["score"] <= 30 and "trust_score" in data, "Normal message scored as LOW CONCERN with trust_score alias")

    # 4. Scam Suspicious OTP
    res = client.post("/api/analyze/scam", json={"content": "Congratulations! You have won ₹50,000. Send your OTP immediately to claim your reward."})
    data = res.json()
    assert_test(res.status_code == 200 and data["score"] >= 70, "Suspicious scam scored HIGH RISK")

    # 5. OTP signal
    res = client.post("/api/analyze/scam", json={"content": "Please share your 6-digit OTP code to verify your bank account login."})
    signals = [s["name"] for s in res.json().get("signals", [])]
    assert_test("OTP Request" in signals, "OTP Request signal detected")

    # 6. Payment scam
    res = client.post("/api/analyze/scam", json={"content": "Urgent: send money via wire transfer or UPI to avoid arrest."})
    signals = [s["name"] for s in res.json().get("signals", [])]
    assert_test("Payment Request" in signals or "Urgency" in signals, "Payment Request / Urgency detected")

    # 7. News Empty Input
    res = client.post("/api/analyze/news", json={"content": " "})
    assert_test(res.status_code == 400, "News empty input rejected with 400")

    # 8. News Normal article
    res = client.post("/api/analyze/news", json={"content": "According to Reuters, international meteorological researchers reported an average 1.2 degree increase in sea surface temperatures."})
    assert_test(res.status_code == 200 and res.json()["score"] <= 50, "Normal news article processed")

    # 9. News Sensational claim
    res = client.post("/api/analyze/news", json={"content": "SHOCKING BOMBSHELL: Drinking this miracle cure guarantees you will live 20 years longer!!!"})
    signals = [s["name"] for s in res.json().get("signals", [])]
    assert_test("Sensationalist Framing" in signals or "Absolute Claims" in signals or "Excessive Punctuation & Emphasis" in signals, "Sensational framing detected")

    # 10. News Clickbait
    res = client.post("/api/analyze/news", json={"content": "You won't believe what happened next when this doctor revealed the hidden trick!"})
    signals = [s["name"] for s in res.json().get("signals", [])]
    assert_test("Clickbait Construct" in signals, "Clickbait construct detected")

    # 11. URL Empty
    res = client.post("/api/analyze/url", json={"url": ""})
    assert_test(res.status_code == 400, "URL empty rejected with 400")

    # 12. URL Invalid
    res = client.post("/api/analyze/url", json={"url": "a"})
    assert_test(res.status_code == 400, "URL too short / invalid rejected with 400")

    # 13. URL Normal HTTPS
    res = client.post("/api/analyze/url", json={"url": "https://www.wikipedia.org"})
    assert_test(res.status_code == 200 and res.json()["score"] <= 30, "Normal HTTPS URL scored as LOW CONCERN")

    # 14. URL Suspicious (IP + HTTP + unusual port)
    res = client.post("/api/analyze/url", json={"url": "http://192.168.1.1:8080/secure/bank/verify-login"})
    signals = [s["name"] for s in res.json().get("signals", [])]
    assert_test(any("IP" in s or "Protocol" in s or "Port" in s or "Keywords" in s for s in signals), "Suspicious URL signals detected")

    # 15. Screenshot valid image upload
    img = Image.new("RGB", (200, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    files = {"file": ("screenshot.png", buf, "image/png")}
    res = client.post("/api/analyze/screenshot", files=files)
    data = res.json()
    assert_test(res.status_code == 200 and "score" in data and "explanation" in data, "Valid screenshot uploaded & analyzed with schema aliases")

    # 16. Screenshot Camera captured format
    cam_img = Image.new("RGB", (640, 480), color=(240, 240, 245))
    cam_buf = io.BytesIO()
    cam_img.save(cam_buf, format="JPEG", quality=92)
    cam_buf.seek(0)
    files = {"file": ("trustlens_photo_2026-10-28T09-30-00-000Z.jpg", cam_buf, "image/jpeg")}
    res = client.post("/api/analyze/screenshot", files=files)
    assert_test(res.status_code == 200 and res.json().get("type") == "screenshot", "Camera captured photo processed successfully")

    # 17. Screenshot unsupported type
    fake_txt = io.BytesIO(b"This is a text file")
    files = {"file": ("fake.pdf", fake_txt, "application/pdf")}
    res = client.post("/api/analyze/screenshot", files=files)
    assert_test(res.status_code == 400, "Unsupported MIME type rejected with 400")

    # 18. Screenshot over 5MB
    large_bytes = io.BytesIO(b"0" * (6 * 1024 * 1024)) # 6MB
    files = {"file": ("large.png", large_bytes, "image/png")}
    res = client.post("/api/analyze/screenshot", files=files)
    assert_test(res.status_code == 413, "Oversized file (>5MB) rejected with 413 Entity Too Large")

    # Summary
    print(f"\nResults: {passed} / {total} tests passed successfully!")
    if passed == total:
        print("ALL BACKEND ENDPOINTS AND SPECIFICATIONS VERIFIED!")
        return 0
    else:
        print("SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
