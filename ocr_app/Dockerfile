FROM ubuntu:20.04
# FROM python:latest

# BECAREFUL when choosing python version 
# 1. To user easyocr, to solve a easyocr issue, I downgraded to 3.7 : https://stackoverflow.com/questions/56239310/could-not-find-a-version-that-satisfies-the-requirement-torch-1-0-0
# FROM python:3.7
# 2. To use OCRmyPDF : python:latest because ghostscript only work with python 3.9 or something
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /src

COPY ./src .

COPY ./requirements.txt ./

RUN apt-get update && apt-get install -y \
    libtesseract-dev tesseract-ocr \ 
    libgl1-mesa-glx \
    ghostscript \
    python3 python3-dev python3-pip \
    patchelf
# wine-stable \
# pngquant

RUN pip install --no-cache-dir --upgrade -r requirements.txt

# RUN python3 -m pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
# RUN pip3 install "paddleocr>=2.6.0.3"
# RUN pip3 install paddleclas>=2.4.3

ENV DEBIAN_FRONTEND=dialog



# RUN cd jbig2enc && \
#     ./autogen.sh && \
#     ./configure && make && \
#     make install
# is it to have a better encoder to have smaller file but it is not necessary right now

# COPY ./src .

CMD ["bash"]