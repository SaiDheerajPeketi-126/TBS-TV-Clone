const express = require("express");
const cors = require("cors");
const TradingView = require("@mathieuc/tradingview");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new TradingView.Client();

/**
 * Get real-time market data
 */
app.get("/market-data", async (req, res) => {
    const { market } = req.query;
    if (!market) return res.status(400).json({ error: "Market is required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            res.json(chart.periods);
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get technical analysis
 */
app.get("/technical-analysis", async (req, res) => {
    const { market } = req.query;
    if (!market) return res.status(400).json({ error: "Market is required" });

    try {
        const analysis = await TradingView.getAnalysis("1d", market);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get multiple indicators
 */
app.get("/indicators", async (req, res) => {
    const { market, indicators } = req.query;
    if (!market || !indicators) return res.status(400).json({ error: "Market and indicators are required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            const results = {};
            indicators.split(",").forEach(ind => {
                results[ind] = chart.indicators[ind] || null;
            });
            res.json(results);
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get invite-only indicators
 */
app.get("/invite-only-indicator", async (req, res) => {
    const { market, indicator } = req.query;
    if (!market || !indicator) return res.status(400).json({ error: "Market and indicator are required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            res.json({ [indicator]: chart.indicators[indicator] || null });
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Backtesting a strategy
 */
app.post("/backtest", async (req, res) => {
    const { market, strategy, settings } = req.body;
    if (!market || !strategy) return res.status(400).json({ error: "Market and strategy are required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            const result = TradingView.backtestStrategy(strategy, settings);
            res.json(result);
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get chart drawings
 */
app.get("/chart-drawings", async (req, res) => {
    const { market } = req.query;
    if (!market) return res.status(400).json({ error: "Market is required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            res.json({ drawings: chart.drawings });
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get data for a date range
 */
app.get("/date-range-data", async (req, res) => {
    const { market, startDate, endDate } = req.query;
    if (!market || !startDate || !endDate) return res.status(400).json({ error: "Market, startDate, and endDate are required" });

    try {
        const chart = new client.Session.Chart();
        chart.setMarket(market);
        chart.onUpdate(() => {
            const filteredData = chart.periods.filter(period => 
                period.time >= new Date(startDate).getTime() / 1000 && 
                period.time <= new Date(endDate).getTime() / 1000
            );
            res.json(filteredData);
            client.end();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`TradingView API Microservice running on port ${port}`));
