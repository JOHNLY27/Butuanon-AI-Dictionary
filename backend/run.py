import uvicorn

if __name__ == "__main__":
    print("Starting Butuanon-English AI Dictionary API local server...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
