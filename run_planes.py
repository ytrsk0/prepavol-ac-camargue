from planes import PlanePerf

p = PlanePerf('S200', 750, 0, 15, 1013)
print("Takeoff:")
print(p.predict('takeoff'))

print("\nLanding:")
print(p.predict('landing'))

