provider "google" {
  project = "adv-cloud-k8s"
  region  = "us-central1-c"
}

resource "google_container_cluster" "primary" {
  name               = "cloud-k8s-cluster"
  location           = "us-central1-c"
  initial_node_count = 1
}

resource "google_container_node_pool" "custom_node_pool_name" {
  name       = "custom-node-pool"
  location   = "us-central1-c"
  cluster    = google_container_cluster.primary.name

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    disk_size_gb = 10
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  initial_node_count = 1
}
