package com.korea.trip.util;

import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.korea.trip.dto.KorailInfo;
import com.korea.trip.dto.StationInfo;

import jakarta.annotation.PostConstruct;

@Component
public class KorailUtil {

    @Value("${korail.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private Map<String, List<StationInfo>> cityStationMap = new HashMap<>();
    public Map<String, List<StationInfo>> getCityStationMap() {
        return cityStationMap;
    }

    private static final Set<String> KNOWN_CITIES = Set.of(
        "서울", "부산", "대구", "인천", "광주", "대전", "울산",
        "세종", "수원", "창원", "용인", "성남", "고양", "청주",
        "전주", "천안", "안산", "포항", "김해", "진주", "제주"
    );

    // 역명 전체를 넣어야 정확히 필터링 됨 (부산역, 서울역 등)
    private static final Set<String> MAJOR_KTX_STATIONS = Set.of(
        "서울역", "부산역", "대전역", "동대구역", "광주송정역", "목포역", "순천역",
        "익산역", "전주역", "천안아산역", "오송역", "신경주역", "울산역", "포항역", "광명역"
    );

    @PostConstruct
    public void init() {
        cityStationMap = fetchCityStationMap();
        System.out.println("✅ 코레일 역 목록 로딩 완료: " + cityStationMap.size() + "개 도시");
        cityStationMap.forEach((city, stations) -> {
            System.out.println(city + " → 역 수: " + stations.size() + ", 역명들: " +
                stations.stream().map(StationInfo::getStationName).toList());
        });
    }

    public String simplifyCityName(String fullCityName) {
        return fullCityName.replace("광역시", "")
                           .replace("특별시", "")
                           .replace("도", "")
                           .trim();
    }

    private String extractCityFromStationName(String stationName) {
        String clean = stationName.replaceAll("역|선", "").trim();
        for (String city : KNOWN_CITIES) {
            if (clean.contains(city)) return city;
        }
        return "기타";
    }

    public Map<String, List<StationInfo>> fetchCityStationMap() {
        Map<String, List<StationInfo>> map = new HashMap<>();
        String cityUrl = "https://apis.data.go.kr/1613000/TrainInfoService/getCtyCodeList"
                + "?serviceKey=" + serviceKey + "&_type=json";

        try {
            ResponseEntity<String> cityResponse = restTemplate.getForEntity(cityUrl, String.class);
            JsonNode cities = mapper.readTree(cityResponse.getBody())
                                    .path("response").path("body").path("items").path("item");

            if (cities.isArray()) {
                for (JsonNode cityNode : cities) {
                    String cityCode = cityNode.path("citycode").asText();
                    String rawCityName = cityNode.path("cityname").asText();
                    String simplifiedCity = simplifyCityName(rawCityName);

                    String stationUrl = "https://apis.data.go.kr/1613000/TrainInfoService/getCtyAcctoTrainSttnList"
                            + "?serviceKey=" + serviceKey + "&_type=json&cityCode=" + cityCode;

                    try {
                        ResponseEntity<String> response = restTemplate.getForEntity(stationUrl, String.class);
                        JsonNode stations = mapper.readTree(response.getBody())
                                                  .path("response").path("body").path("items").path("item");

                        List<StationInfo> list = new ArrayList<>();
                        if (stations.isArray()) {
                            for (JsonNode s : stations) {
                                String stationName = s.path("nodename").asText();
                                String stationCode = s.path("nodeid").asText();
                                String city = extractCityFromStationName(stationName);
                                list.add(new StationInfo(stationCode, stationName, city));
                            }
                        } else if (stations.isObject()) {
                            String stationName = stations.path("nodename").asText();
                            String stationCode = stations.path("nodeid").asText();
                            String city = extractCityFromStationName(stationName);
                            list.add(new StationInfo(stationCode, stationName, city));
                        }
                        map.put(simplifiedCity, list);
                    } catch (Exception e) {
                        System.err.println("🛑 [" + rawCityName + "] 역 조회 실패: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("🛑 도시 코드 목록 로딩 실패: " + e.getMessage());
        }

        return map;
    }

    public List<StationInfo> getStationsByCityKeyword(String cityKeyword) {
        String simplified = simplifyCityName(cityKeyword);
        List<StationInfo> result = new ArrayList<>();
        for (Map.Entry<String, List<StationInfo>> entry : cityStationMap.entrySet()) {
            if (entry.getKey().contains(simplified)) {
                result.addAll(entry.getValue());
            }
        }
        return result;
    }

    // 역명이 MAJOR_KTX_STATIONS 중 하나를 포함하는 역만 필터링 (contains 사용)
    public List<StationInfo> getMajorStationsByCityKeyword(String cityKeyword) {
        return getStationsByCityKeyword(cityKeyword).stream()
                .filter(s -> {
                    String name = s.getStationName().replace("역", "").trim();
                    return MAJOR_KTX_STATIONS.stream()
                            .anyMatch(major -> major.replace("역", "").equals(name));
                })
                .toList();
    }
    
    public List<KorailInfo> fetchKorail(String depStationId, String arrStationId, String date) {
        List<KorailInfo> results = new ArrayList<>();
        String url = "https://apis.data.go.kr/1613000/TrainInfoService/getStrtpntAlocFndTrainInfo"
                + "?serviceKey=" + serviceKey
                + "&_type=json"
                + "&depPlaceId=" + depStationId
                + "&arrPlaceId=" + arrStationId
                + "&depPlandTime=" + date;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode items = mapper.readTree(response.getBody())
                                   .path("response").path("body").path("items").path("item");

            if (items.isArray()) {
                for (JsonNode item : items) {
                    results.add(new KorailInfo(
                            item.path("traingradename").asText(),
                            item.path("trainno").asText(),
                            item.path("depplandtime").asText(),
                            item.path("arrplandtime").asText(),
                            item.path("depplacename").asText(),
                            item.path("arrplacename").asText(),
                            item.path("adultcharge").asInt()
                    ));
                }
            } else if (items.isObject()) {
                JsonNode item = items;
                results.add(new KorailInfo(
                        item.path("traingradename").asText(),
                        item.path("trainno").asText(),
                        item.path("depplandtime").asText(),
                        item.path("arrplandtime").asText(),
                        item.path("depplacename").asText(),
                        item.path("arrplacename").asText(),
                        item.path("adultcharge").asInt()
                ));
            }
        } catch (Exception e) {
            System.err.println("🛑 열차 조회 실패: " + e.getMessage());
        }

        return results;
    }

    public List<KorailInfo> fetchKorailByCityKeyword(String depCityKeyword, String arrCityKeyword, String date) {
        List<StationInfo> depStations = getStationsByCityKeyword(depCityKeyword);
        List<StationInfo> arrStations = getStationsByCityKeyword(arrCityKeyword);

        List<KorailInfo> allResults = new ArrayList<>();

        for (StationInfo dep : depStations) {
            for (StationInfo arr : arrStations) {
                System.out.printf("🔍 기차 조회: %s(%s) → %s(%s) 날짜: %s\n",
                        dep.getStationName(), dep.getStationCode(),
                        arr.getStationName(), arr.getStationCode(), date);

                List<KorailInfo> results = fetchKorail(dep.getStationCode(), arr.getStationCode(), date);
                if (results != null && !results.isEmpty()) {
                    allResults.addAll(results);
                }
            }
        }

        if (allResults.isEmpty()) {
            allResults.add(new KorailInfo("해당 날짜에 열차 정보가 없습니다.", "", "", "", "", "", 0));
        }

        return allResults;
    }

    public List<KorailInfo> fetchKorailBetweenMajorStations(String depCityKeyword, String arrCityKeyword, String date) {
        List<StationInfo> depStations = getMajorStationsByCityKeyword(depCityKeyword);
        List<StationInfo> arrStations = getMajorStationsByCityKeyword(arrCityKeyword);

        List<KorailInfo> allResults = new ArrayList<>();

        for (StationInfo dep : depStations) {
            for (StationInfo arr : arrStations) {
                System.out.printf("🔍 [주요역] 기차 조회: %s(%s) → %s(%s) 날짜: %s\n",
                        dep.getStationName(), dep.getStationCode(),
                        arr.getStationName(), arr.getStationCode(), date);

                List<KorailInfo> results = fetchKorail(dep.getStationCode(), arr.getStationCode(), date);
                if (results != null && !results.isEmpty()) {
                    allResults.addAll(results);
                }
            }
        }

        if (allResults.isEmpty()) {
            allResults.add(new KorailInfo("[주요역] 해당 날짜에 열차 정보가 없습니다.", "", "", "", "", "", 0));
        }

        return allResults;
    }
}
