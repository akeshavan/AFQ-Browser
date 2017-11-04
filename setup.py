import os
from setuptools import setup, find_packages
PACKAGES = find_packages()

# Get version and release info, which is all stored in shablona/version.py
ver_file = os.path.join('afqbrowser', 'version.py')
with open(ver_file) as f:
    exec(f.read())

REQUIRES = []
with open('requirements.txt') as f:
    l = f.readline()[:-1].split("=")[0].split(">")[0]
    while l:
        REQUIRES.append(l)
        l = f.readline()[:-1].split("=")[0].split(">")[0]


opts = dict(name=NAME,
            maintainer=MAINTAINER,
            maintainer_email=MAINTAINER_EMAIL,
            description=DESCRIPTION,
            long_description=LONG_DESCRIPTION,
            url=URL,
            download_url=DOWNLOAD_URL,
            license=LICENSE,
            classifiers=CLASSIFIERS,
            author=AUTHOR,
            author_email=AUTHOR_EMAIL,
            platforms=PLATFORMS,
            version=VERSION,
            packages=PACKAGES,
            package_data=PACKAGE_DATA,
            requires=REQUIRES,
            install_requires=REQUIRES,
            scripts=SCRIPTS)


if __name__ == '__main__':
    setup(**opts)
