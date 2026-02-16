.PHONY: test build-dict serve clean

test:
	node --test tests/

build-dict:
	node scripts/build-dictionary.js

serve:
	python3 -m http.server -d web 8000

clean:
	rm -rf docs
