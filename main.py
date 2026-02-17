import os, random, time, json
import requests

BASE = os.environ["VERCEL_API_BASE"].rstrip("/")
API_KEY = os.environ["INTERNAL_API_KEY"]

def call_generate(prompt: str):
    url = f"{BASE}/api/generate"
    payload = {
        "prompt": prompt,
        # 필요하면 아래처럼 옵션도 추가 가능 (Suno가 받는 필드는 바뀔 수 있음)
        # "make_instrumental": False,
        # "title": "auto",
        # "tags": "kpop, upbeat"
    }
    r = requests.post(url, json=payload, headers={"x-api-key": API_KEY}, timeout=120)
    return r.status_code, r.text

def main():
    n = random.randint(8, 16)

    prompts = [
        "Upbeat K-pop style, catchy hook, bright synths, 120bpm",
        "Lo-fi chill beat, warm vinyl noise, mellow piano, 80bpm",
        "Worship pop, uplifting chorus, modern production, emotional build",
        "EDM house, festival vibe, strong drop, 128bpm",
    ]

    for i in range(n):
        prompt = random.choice(prompts)
        code, text = call_generate(prompt)
        print(f"[{i+1}/{n}] status={code}")
        print(text[:500])
        # rate-limit 완화
        time.sleep(random.uniform(2, 6))

if __name__ == "__main__":
    main()
