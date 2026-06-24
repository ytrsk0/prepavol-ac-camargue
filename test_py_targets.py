
import pandas as pd
import numpy as np
from planes import PlanePerf

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

def test():
    plane = "DR400-120"
    csv_path = f"data/{plane}_takeoff.csv"
    df = pd.read_csv(csv_path, sep="\t", header=0)
    df = df.melt(id_vars=["alt", "temp"], var_name="mass", value_name="m")
    df["temp"] = df["temp"] + 273
    df["mass"] = df["mass"].astype("int")
    
    print("Python Training Data (first 5 rows):")
    print(df.head(5))
    
    X = df.iloc[:, :3]
    y = df.iloc[:, 3]
    
    poly = PolynomialFeatures(2)
    X_poly = poly.fit_transform(X)
    
    m = LinearRegression()
    m.fit(X_poly, y)
    
    print("\nPolynomial Feature Names:")
    print(poly.get_feature_names_out(["alt", "temp", "mass"]))
    
    print("\nFitted Coefficients:")
    print("Intercept:", m.intercept_)
    print("Coeffs:", m.coef_)
    
    pred = m.predict(poly.transform([[0, 15 + 273, 771.9]]))[0]
    print(f"\nPrediction for 0ft, 15C (288K), 771.9kg: {pred:.4f}m")

if __name__ == "__main__":
    test()
