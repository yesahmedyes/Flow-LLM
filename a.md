Certainly! Below is an example of the Bubble Sort algorithm implemented in Python. Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.

### Bubble Sort in Python

```python
def bubble_sort(arr):
    n = len(arr)  # Get the length of the array
    # Traverse through all array elements
    for i in range(n):
        # Last i elements are already in place
        swapped = False
        for j in range(0, n - i - 1):
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if elements are in the wrong order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        # If no two elements were swapped in the inner loop, then break
        if not swapped:
            break

# Example usage
if __name__ == "__main__":
    my_array = [64, 34, 25, 12, 22, 11, 90]
    print("Original array:", my_array)
    bubble_sort(my_array)
    print("Sorted array:", my_array)
```

### Explanation

- **Function Definition**: The function `bubble_sort(arr)` takes a list `arr` as input.
- **Outer Loop**: Runs `n` times where `n` is the length of the array. This ensures that we make enough passes over the entire list.
- **Inner Loop**: Compares each pair of adjacent items and swaps them if they are out of order.
- **Optimization (Swapped Flag)**: If during a pass no swaps are made, the array is already sorted, and the function exits early.

### Output

If you run the code, you will see the output before and after sorting:

```
Original array: [64, 34, 25, 12, 22, 11, 90]
Sorted array: [11, 12, 22, 25, 34, 64, 90]
```

Feel free to modify the `my_array` variable to test with different sets of numbers!
