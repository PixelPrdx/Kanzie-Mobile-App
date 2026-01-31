using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Kanzie.Api.Services
{
    public interface IGooglePlacesService
    {
        Task<List<GooglePlaceSearchResult>> SearchNearbyAsync(double lat, double lng, string type, int radius = 5000);
        string GetPhotoUrl(string photoResourceName, int maxWidth = 800);
    }

    public class GooglePlacesService : IGooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;

        public GooglePlacesService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _apiKey = _configuration["GooglePlaces:ApiKey"] ?? "";
        }

        public async Task<List<GooglePlaceSearchResult>> SearchNearbyAsync(double lat, double lng, string type, int radius = 5000)
        {
            if (string.IsNullOrEmpty(_apiKey)) return new List<GooglePlaceSearchResult>();

            var request = new
            {
                includedTypes = new[] { type },
                maxResultCount = 20,
                locationRestriction = new
                {
                    circle = new
                    {
                        center = new { latitude = lat, longitude = lng },
                        radius = (double)radius
                    }
                }
            };

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-Goog-Api-Key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location,places.photos,places.types,places.editorialSummary");

            var response = await _httpClient.PostAsJsonAsync("https://places.googleapis.com/v1/places:searchNearby", request);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Google Places API Error: {error}");
                return new List<GooglePlaceSearchResult>();
            }

            var result = await response.Content.ReadFromJsonAsync<GooglePlacesResponse>();
            return result?.Places ?? new List<GooglePlaceSearchResult>();
        }

        public string GetPhotoUrl(string photoResourceName, int maxWidth = 800)
        {
            if (string.IsNullOrEmpty(photoResourceName) || string.IsNullOrEmpty(_apiKey)) return "";
            
            // photoResourceName is usually in format "places/PLACE_ID/photos/PHOTO_ID"
            return $"https://places.googleapis.com/v1/{photoResourceName}/media?key={_apiKey}&maxWidthPx={maxWidth}";
        }
    }

    public class GooglePlacesResponse
    {
        [JsonPropertyName("places")]
        public List<GooglePlaceSearchResult> Places { get; set; } = new();
    }

    public class GooglePlaceSearchResult
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = null!;

        [JsonPropertyName("displayName")]
        public DisplayName DisplayName { get; set; } = null!;

        [JsonPropertyName("formattedAddress")]
        public string? FormattedAddress { get; set; }

        [JsonPropertyName("location")]
        public LocationCoords Location { get; set; } = null!;

        [JsonPropertyName("photos")]
        public List<GooglePhoto>? Photos { get; set; }

        [JsonPropertyName("types")]
        public List<string>? Types { get; set; }

        [JsonPropertyName("editorialSummary")]
        public DisplayName? EditorialSummary { get; set; }
    }

    public class DisplayName
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = null!;
    }

    public class LocationCoords
    {
        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }
        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }
    }

    public class GooglePhoto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!; // This is the resource name
    }
}
