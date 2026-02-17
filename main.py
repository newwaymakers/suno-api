import os
import requests

# GitHub Secrets에서 주소를 가져옵니다.
API_URL = os.getenv("SUNO_API_URL")

def make_song():
    payload = {
        "prompt": "A trendy K-pop song about a coding genius", # 여기에 원하는 주제를 쓰세요!
        "make_instrumental": False,
        "wait_audio": True
    }
    
    print("🎵 노래 공장 가동 중...")
    try:
        response = requests.post(f"{API_URL}/api/generate", json=payload)
        if response.status_code == 200:
            song_data = response.json()
            print(f"✅ 성공! 노래 주소: {song_data[0]['audio_url']}")
        else:
            print(f"❌ 실패: {response.text}")
    except Exception as e:
        print(f"❌ 에러 발생: {e}")

if __name__ == "__main__":
    make_song()
