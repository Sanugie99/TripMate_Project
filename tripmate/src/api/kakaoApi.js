import axios from "axios";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

export const searchPlacesByKeyword = async (keyword) => {
  if (!keyword || !keyword.trim()) {
    console.warn("검색어가 비어있습니다.");
    return [];
  }

  try {
    const res = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
      params: { query: keyword.trim() },
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        'KA': 'origin=tripmate'
      }
    });
    return res.data.documents;
  } catch (error) {
    console.error("장소 검색 실패:", error.response ? error.response.data : error.message);
    return [];
  }
};
