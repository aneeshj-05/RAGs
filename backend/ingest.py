import fitz

CHUNK_SIZE=800
CHUNK_OVERLAP=150

def extract_text(pdf_path:str)->str:
    doc=fitz.open(pdf_path)
    text=""
    for page in doc:
        text+=page.get_text()
    doc.close()
    return text

def chunk_text(text:str):
    chunks=[]
    start=0
    while start<len(text):
        end=min(start+CHUNK_SIZE,len(text))
        chunks.append(text[start:end])
        if end==len(text):
            break
        start=end-CHUNK_OVERLAP
    return chunks

def process_pdf(pdf_path:str):
    text=extract_text(pdf_path)
    return chunk_text(text)