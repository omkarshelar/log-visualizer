package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"
)

// Struct to log request metrics
type RequestLog struct {
	Timestamp     string `json:"timestamp"`
	RequestPath   string `json:"request_path"`
	RequestMethod string `json:"request_method"`
	StatusCode    int    `json:"status_code"`
	ClientIP      string `json:"client_ip"`
	LatencyMs     int64  `json:"latency_ms"`
	RequestSize   int64  `json:"request_size"`
	ResponseSize  int64  `json:"response_size"`
	Message       string `json:"message"`
}

var (
	logFile *os.File
	mu      sync.Mutex
)

func main() {
	// Parse port from command-line arguments
	port := flag.String("port", "8080", "Port to run the web server on")
	flag.Parse()

	// Open the log file
	var err error
	logFile, err = os.OpenFile("server_metrics.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}
	defer logFile.Close()

	// Create HTTP server
	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", *port),
		Handler: logRequest(mux),
	}

	log.Printf("Server running on port %s\n", *port)
	log.Fatal(server.ListenAndServe())
}

// Middleware to log request metrics
func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simulate latency
		latency := time.Duration(rand.Intn(490)+10) * time.Millisecond
		time.Sleep(latency)

		// Randomize response status codes
		status := 200
		if rand.Float32() < 0.1 {
			status = 500
		} else if rand.Float32() < 0.2 {
			status = 404
		}

		domains := []string{"gmail.com", "yahoo.com", "example.com", "asu.edu"}
		randomDomain := domains[rand.Intn(len(domains))]
		userEmail := fmt.Sprintf("user%d@%s", rand.Intn(10000), randomDomain)

		// Measure request and response sizes
		requestSize := r.ContentLength
		responseSize := int64(len("Hello, World!"))

		// Generate a message based on the status code
		message := fmt.Sprintf("User email: %s", userEmail)
		switch status {
		case 500:
			message += " - error logs"
		case 404:
			message += " - request path not found"
		case 401:
			message += " - unauthorized access"
		default:
			message += fmt.Sprintf(" - status code: %d", status)
		}

		// Log request
		logEntry := RequestLog{
			Timestamp:     time.Now().Format(time.RFC3339),
			RequestPath:   r.URL.Path,
			RequestMethod: r.Method,
			StatusCode:    status,
			ClientIP:      r.RemoteAddr,
			LatencyMs:     latency.Milliseconds(),
			RequestSize:   requestSize,
			ResponseSize:  responseSize,
			Message:       message,
		}
		logToFile(logEntry)

		// Respond to request
		w.WriteHeader(status)
		w.Write([]byte("Hello World!"))

		next.ServeHTTP(w, r)
	})
}

// Log request metrics to file
func logToFile(logEntry RequestLog) {
	mu.Lock()
	defer mu.Unlock()

	entry, err := json.Marshal(logEntry)
	if err != nil {
		log.Printf("Failed to marshal log entry: %v", err)
		return
	}
	_, err = logFile.Write(append(entry, '\n'))
	if err != nil {
		log.Printf("Failed to write log entry: %v", err)
	}
}

// Handler for incoming requests
func handler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(""))
}
