import re


URL_PATTERN = re.compile(r"\b(?:https?://|www\.)\S+", re.IGNORECASE)
SHORTENER_DOMAINS = ("bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly")


def analyze_severity(message):
    text = message.lower()
    reasons = []
    strong_indicators = 0

    urls = URL_PATTERN.findall(message)
    suspicious_urls = []
    for url in urls:
        normalized_url = url.rstrip(".,!?;:)")
        if (
            normalized_url.lower().startswith("http://")
            or any(domain in normalized_url.lower() for domain in SHORTENER_DOMAINS)
            or re.search(r"https?://(?:\d{1,3}\.){3}\d{1,3}", normalized_url, re.IGNORECASE)
            or "xn--" in normalized_url.lower()
        ):
            suspicious_urls.append(normalized_url)

    if suspicious_urls:
        reasons.append("Contains suspicious URL(s): " + ", ".join(suspicious_urls))
        strong_indicators += 1

    credential_pattern = r"\b(passwords?|passcodes?|otps?|pins?|bank(?:ing)? credentials?|card details)\b"
    credential_action_pattern = r"\b(verify|confirm|share|send|provide|enter|update|submit|reply with)\b"
    if re.search(credential_pattern, text) and re.search(credential_action_pattern, text):
        reasons.append("Requests sensitive credentials such as a password, OTP, PIN, or banking details")
        strong_indicators += 1

    if re.search(r"\b(pay(?:ment)?|pay now|transfer|wire|send money|fee|billing|bank transfer|gift card)\b", text):
        reasons.append("Requests or mentions a financial payment or money transfer")
        strong_indicators += 1

    urgency_found = bool(re.search(r"\b(urgent(?:ly)?|immediately|act now|right away|asap|within \d+ hours?)\b", text))
    if urgency_found:
        reasons.append("Uses urgent or immediate-action language")
        strong_indicators += 1

    account_warning_found = bool(re.search(
        r"\b(account|card|banking|security)\b.{0,45}\b(block(?:ed)?|suspend(?:ed|ed)?|lock(?:ed)?|compromis(?:ed|e)|security alert|unusual activity)\b"
        r"|\b(block(?:ed)?|suspend(?:ed|ed)?|lock(?:ed)?)\b.{0,45}\b(account|card|banking|access)\b",
        text,
    ))
    if account_warning_found:
        reasons.append("Warns that an account or access may be blocked, suspended, or compromised")
        strong_indicators += 1

    prize_found = bool(re.search(r"\b(prize|reward|winner|winning|won|lottery|giveaway|claim your)\b", text))
    if prize_found:
        reasons.append("Claims a prize, reward, or winnings")
        strong_indicators += 1

    credential_request_found = bool(
        re.search(credential_pattern, text) and re.search(credential_action_pattern, text)
    )
    if strong_indicators >= 3 or (strong_indicators >= 2 and (credential_request_found or (suspicious_urls and urgency_found))):
        level = "High"
    elif strong_indicators:
        level = "Medium"
    else:
        level = "Low"

    return {"level": level, "reasons": reasons}


if __name__ == "__main__":
    test_message = "URGENT! Your bank account will be blocked. Verify your OTP immediately at http://example.com"
    print(analyze_severity(test_message))
