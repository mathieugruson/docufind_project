## Command to play with the code with a Dockerfile

### You need docker and docker-compose to launch it

```console
docker build -t python_ocr .
docker run -v $(pwd)/src:/src -it python_ocr
```

or if container is stopped

```console
docker start charming_shamir
docker exec -it charming_shamir /bin/bash
```

## Command to play with a docker-compose.yml

```console
make
```

## Command to make a executable with pyinstaller (to launch it)

```
pyinstaller --copy-metadata pikepdf --copy-metadata ocrmypdf --collect-submodules ocrmypdf --collect-datas ocrmypdf.data --onefile main.py
```

https://github.com/ocrmypdf/OCRmyPDF/issues/659#issuecomment-1517712600

Then, the executable file in in the dist file (do not forget to replace in root if you want to be able to access the path indicated
in the program)

## Docs

### OCRmyPDF

    https://ocrmypdf.readthedocs.io/en/latest/installation.html

### pytesseract

    lien a venir

### easyocr

    https://www.jaided.ai/easyocr/documentation/

### keras_ocr

    https://keras-ocr.readthedocs.io/en/latest/
