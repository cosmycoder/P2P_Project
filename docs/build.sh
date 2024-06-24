#!/bin/bash
pandoc -f markdown Relazione.md -o Relazione.pdf -N
mv Relazione.pdf ..
