export interface DriveConfig {
  type: 's3' | 'azure'
}

export interface Drive {
  name: string
}

export interface S3Config {
  bucket: string
  region: string
}

export interface S3Drive {
  name: 's3'
}

export interface AzureConfig {
  container: string
}

export interface AzureDrive {
  name: 'azure'
}
