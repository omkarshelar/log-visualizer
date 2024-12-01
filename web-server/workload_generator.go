package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/fatih/color"
)

// List of random paths to simulate various endpoints
var paths = []string{"/", "/api", "/login", "/logout", "/dashboard", "/settings"}

func main() {
	// Command-line flags
	serverURL := flag.String("url", "http://localhost:8080", "URL of the server to send requests to")
	interval := flag.Int("interval", 1000, "Interval between requests in milliseconds")
	concurrentClients := flag.Int("clients", 1, "Number of concurrent clients generating traffic")
	flag.Parse()

	log.Printf("Starting workload generator: URL=%s, Interval=%dms, Clients=%d\n", *serverURL, *interval, *concurrentClients)

	// WaitGroup to manage concurrent clients
	var wg sync.WaitGroup

	// Start multiple clients
	for i := 0; i < *concurrentClients; i++ {
		wg.Add(1)
		go func(clientID int) {
			defer wg.Done()
			generateTraffic(*serverURL, *interval, clientID)
		}(i)
	}

	// Wait for all clients to finish (infinite loop unless interrupted)
	wg.Wait()
}

// Function to generate traffic for a single client
func generateTraffic(serverURL string, interval int, clientID int) {
	// rand.Seed(time.Now().UnixNano() + int64(clientID)) // Unique seed for each client
	client := &http.Client{}

	for {
		// Pick a random path from the list
		path := paths[rand.Intn(len(paths))]

		// Construct the full URL
		url := fmt.Sprintf("%s%s", serverURL, path)

		// Send the request
		start := time.Now()
		resp, err := client.Get(url)
		latency := time.Since(start)

		if err != nil {
			log.Printf("[Client %d] Error sending request to %s: %v\n", clientID, url, err)
		} else {
			status := resp.StatusCode
			resp.Body.Close()
			printRequest(clientID, url, status, latency, start)
		}

		// Wait for the specified interval before the next request
		time.Sleep(time.Duration(interval) * time.Millisecond)
	}
}

func printRequest(clientID int, url string, status int, latency time.Duration, startTime time.Time) {
	// Format the timestamp
	timeStr := startTime.Format("2006/01/02 15:04:05")

	// Format the status code with colors
	statusStr := fmt.Sprintf("%d", status)
	if status >= 400 && status < 500 {
		statusStr = color.New(color.FgRed).SprintFunc()(statusStr) // Red for 4xx
	} else if status >= 500 {
		statusStr = color.New(color.FgRed, color.Bold).SprintFunc()(statusStr) // Bold red for 5xx
	}

	// Print formatted output
	fmt.Printf("%s [Client %d] %s - Status: %s, Latency: %v\n",
		timeStr, clientID, url, statusStr, latency)
}
