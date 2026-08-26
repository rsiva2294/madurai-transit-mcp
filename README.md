# 🚌 Madurai CityBus Model Context Protocol (MCP) Server

[![npm version](https://img.shields.io/npm/v/madurai-transit-mcp?color=blue)](https://www.npmjs.com/package/madurai-transit-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by MaduraiOne](https://img.shields.io/badge/Powered%20By-MaduraiOne-0284c7)](https://maduraione.in)

The official **Model Context Protocol (MCP)** server for Madurai CityBus public transit, connecting AI assistants (**Claude Desktop, Cursor, Gemini, AI Agents**) to Madurai's bus route network, official stage fares, stop sequences, and platform bay departures.

---

## ⚡ Features

- **Route Discovery**: Direct and 1-transfer routing across 966 bus routes and 3,000 stops in Madurai.
- **Official Stage Fares**: Authoritative TNSTC stage fare breakdowns (Ordinary, LSS, Express, Deluxe AC).
- **Platform Bay Intelligence**: Departure platforms (I/II/III/IV) at Periyar Bus Stand.
- **Bilingual Stop Search**: Search stops in English, Tamil Unicode (`பெரியார்`), or colloquial transliterations.
- **Interactive Deep Links**: Automatically returns canonical links (`https://maduraione.in/route/...`) for live visual route maps.

---

## 🚀 Quick Setup

### 1. Claude Desktop

Add this configuration to your `claude_desktop_config.json`:

* **MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "madurai-bus": {
      "command": "npx",
      "args": ["-y", "madurai-transit-mcp"]
    }
  }
}
```

---

### 2. Cursor IDE

Add this to `.cursor/mcp.json` or in **Cursor Settings ➔ Features ➔ MCP**:

```json
{
  "mcpServers": {
    "madurai-bus": {
      "command": "npx",
      "args": ["-y", "madurai-transit-mcp"]
    }
  }
}
```

---

### 3. Local Testing with MCP Inspector

You can test all tools interactively using the official MCP Inspector:

```bash
npx @modelcontextprotocol/inspector npx -y madurai-transit-mcp
```

---

## 🛠️ Available MCP Tools

### `search_bus_routes`
Find direct and 1-transfer bus routes between two locations in Madurai.

```json
{
  "from": "Periyar",
  "to": "Alagarkovil",
  "max_transfers": 1
}
```

### `get_bus_details`
Get full route details, spoke category, departure platform bay, and complete stop sequence for a specific bus number.

```json
{
  "bus_number": "44"
}
```

### `search_bus_stops`
Bilingual search (English & Tamil) for bus stops with spoke classifications and verified GPS coordinates.

```json
{
  "query": "பெரியார்"
}
```

### `calculate_fare`
Calculate exact official TNSTC stage fares across all service classes (Ordinary, LSS, Express, Deluxe AC).

```json
{
  "boarding_stop": "PERIYAR BUS STAND",
  "alighting_stop": "MGR BUS STAND",
  "bus_number": "77"
}
```

---

## ⚠️ Ground Realities & Disclaimers

Public transit in Tier-2 Indian cities operates differently from Western transit models:
1. **Headway Frequency vs. Timetables**: TNSTC Madurai buses operate on shift-based headway frequency rather than published minute-by-minute digital timetables.
2. **Topological vs. Surveyed GPS**: Out of ~3,000 stops across the district, ~600 core urban stops have verified survey coordinates. Remaining rural/peri-urban stops are mapped topologically by sequence.
3. **Multi-Leg Transfers**: Interchange suggestions use the **7-Spoke Madurai Topological Model** and should be treated as guidance. Commuters should verify live platform departures at bus stands.

---

## 🌐 Powered By

- **Web App & Live Bus Telemetry**: [https://maduraione.in](https://maduraione.in)
- **Android App**: Available on Google Play Store
- **Main Repository**: [https://github.com/rsiva2294/madurai-bus-route-finder](https://github.com/rsiva2294/madurai-bus-route-finder)

---

## 📄 License

MIT © [MaduraiOne](https://maduraione.in)
