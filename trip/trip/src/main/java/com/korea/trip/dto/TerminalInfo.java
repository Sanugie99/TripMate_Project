package com.korea.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TerminalInfo {
    private String terminalId;
    private String terminalName;
    private String city;
   
}
