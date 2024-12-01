# log-visualizer
Visualize and search software logs in one place.

Features: 
- Query logs with fuzzy search
- Aggregation from multiple source(multiple servers)
- Visualize key metrics for understanding.
- Uses ElasticSearch with Filebeat extension, so minimal changes needed to you server log configuration

Summary:
The technology used is ElasticSearch with the elasticsearch's filebeat extension. Filebeat streams data to the Elasticsearch instance before being queried by the frontend for data visualization.
I used chart.js for data visualizations, and have three time series data graphs - Request count per unit time(line graph), status code distribution(stacked bar graph) and average latency per unit time interval.
The application also offers fuzzy search for logs by client IP/email/HTTP request methods, or any other custom string present in the log json. The metrics update according to the filter criteria, which means one can for example see latency summary for one particular user or IP address.
The application can be extended to use with database server logs as well, visualizing for example, query response times and cache hit-miss ratio. This is a minimal AWS Cloudwatch logs(or similar products) clone, which if improved can be potentially be cheaper, more manageable, cloud technology agnostic especially if the number of server to monitor are large.



### Overview
![alt text](docs/1.png "Overview")

### Latency Graph(time series)
![alt text](docs/2.png "Latency Graph")

### Status Code Split(time series)
![alt text](docs/3.png "Status Code Split")

### Requests Per minute(time series)
![alt text](docs/4.png "Requests Per minute")

### Logs
![alt text](docs/5.png "Logs")

### Fuzzy search with search result visualization
![alt text](docs/6.png "Fuzzy search visualization")
![alt text](docs/7.png "Fuzzy search logs")
