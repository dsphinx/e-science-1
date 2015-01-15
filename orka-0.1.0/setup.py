#!/usr/bin/env python
# -*- coding: utf-8 -*-


"""setup.py: setuptools control."""

import ez_setup
ez_setup.use_setuptools()
from os.path import dirname, abspath, join
from setuptools import setup
BASE_DIR = join(dirname(abspath(__file__)), 'orka/orka.py')
import orka

# to be setup if not found
requires = ['kamaki==0.13rc3','paramiko','requests','PyYAML']

# setup
setup(
    name = "orka",
    packages = ["orka"],
    # starts from this main
    entry_points = {
        "console_scripts": ['orka = orka.orka:main']
        },
    package_data = {
        # If any package contains *.txt or *.rst files, include them:
        '': ['*.txt', 'ansible/roles/*/*/*', 'ansible/group_vars/*',
             'ansible/*.yml', 'ansible/*.cfg']
    },
    include_package_data=True,
    version = orka.__version__,
    description = "Python command line application for creating and deleting Hadoop clusters in ~okeanos.",
    install_requires = requires
    )
