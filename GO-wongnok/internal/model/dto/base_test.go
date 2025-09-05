package dto

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBaseListResponse_WithTotal(t *testing.T) {
	response := BaseListResponse[[]string]{
		Total:   10,
		Results: []string{"item1", "item2", "item3"},
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "\"total\":10")
	assert.Contains(t, string(jsonData), "item1")

	var unmarshaled BaseListResponse[[]string]
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, int64(10), unmarshaled.Total)
	assert.Equal(t, 3, len(unmarshaled.Results))
	assert.Equal(t, "item1", unmarshaled.Results[0])
}

func TestBaseListResponse_WithoutTotal(t *testing.T) {
	response := BaseListResponse[[]string]{
		Results: []string{"item1", "item2"},
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	// Total should be omitted when zero due to omitempty tag
	assert.NotContains(t, string(jsonData), "total")
	assert.Contains(t, string(jsonData), "item1")
}

func TestBaseListResponse_EmptyResults(t *testing.T) {
	response := BaseListResponse[[]string]{
		Total:   0,
		Results: []string{},
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	var unmarshaled BaseListResponse[[]string]
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), unmarshaled.Total)
	assert.Equal(t, 0, len(unmarshaled.Results))
}

func TestBaseListResponse_DifferentTypes(t *testing.T) {
	// Test with integers
	intResponse := BaseListResponse[[]int]{
		Total:   3,
		Results: []int{1, 2, 3},
	}

	jsonData, err := json.Marshal(intResponse)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "\"total\":3")

	// Test with custom struct
	type TestStruct struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	structResponse := BaseListResponse[[]TestStruct]{
		Total: 2,
		Results: []TestStruct{
			{ID: 1, Name: "Test1"},
			{ID: 2, Name: "Test2"},
		},
	}

	jsonData, err = json.Marshal(structResponse)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "Test1")
	assert.Contains(t, string(jsonData), "Test2")
}

func TestBaseListResponse_SingleItem(t *testing.T) {
	response := BaseListResponse[string]{
		Total:   1,
		Results: "single item",
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "single item")

	var unmarshaled BaseListResponse[string]
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, "single item", unmarshaled.Results)
}
