package com.korea.trip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.korea.trip.dto.TransportRequest;
import com.korea.trip.dto.TransportResult;
import com.korea.trip.service.TransportService;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

	private final TransportService transportService;

	public TransportController(TransportService transportService) {
		this.transportService = transportService;
	}

	@PostMapping("/search")
	public ResponseEntity<TransportResult> search(@RequestBody TransportRequest request) {
		return ResponseEntity.ok(transportService.recommendTransport(request));
	}

	// 🔽 GET 방식 추가
	@GetMapping("/search")
	public ResponseEntity<TransportResult> searchWithQuery(
			@RequestParam("departure") String departure,
			@RequestParam("arrival") String arrival,
			@RequestParam("date") String date){
		TransportRequest request = new TransportRequest();
		request.setDeparture(departure);
		request.setArrival(arrival);
		request.setDate(date);


		return ResponseEntity.ok(transportService.recommendTransport(request));
	}
}
