package main

import (
	"testing"
)

func TestSample(t *testing.T) {
	expected := 2
	actual := 1 + 1
	if actual != expected {
		t.Errorf("expected %d, got %d", expected, actual)
	}
}
