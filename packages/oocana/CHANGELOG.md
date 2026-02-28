# Changelog

## [0.24.2](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.24.1...@oomol/oocana-v0.24.2) (2026-02-28)


### Features

* **oocana:** add --remote-block-url and --remote-block-timeout CLI args ([#426](https://github.com/oomol/oocana-node/issues/426)) ([ad1d03a](https://github.com/oomol/oocana-node/commit/ad1d03a774b91710cc3b1933b3641eee3143687c))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.36 ([#424](https://github.com/oomol/oocana-node/issues/424)) ([9374858](https://github.com/oomol/oocana-node/commit/93748589a7dbcb457ef81c76f572363197540f3b))

## [0.24.1](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.24.0...@oomol/oocana-v0.24.1) (2026-01-30)


### Code Refactoring

* **layer:** use structured BindPath type instead of string[] ([#421](https://github.com/oomol/oocana-node/issues/421)) ([0870924](https://github.com/oomol/oocana-node/commit/0870924761026afc6ad0625cf47c6f241ec9f8fe))

## [0.24.0](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.36...@oomol/oocana-v0.24.0) (2026-01-30)


### ⚠ BREAKING CHANGES

* **oocana:** Remove deprecated parameters from FlowConfig interface. Use `nodesInputs` instead of `inputValues`, and `nodes` instead of `toNode`.
* **oocana:** replace bindPaths string[] with structured BindPath type ([#419](https://github.com/oomol/oocana-node/issues/419))

### Bug Fixes

* **query,layer:** use strict equality for exit code checks ([#415](https://github.com/oomol/oocana-node/issues/415)) ([b764f70](https://github.com/oomol/oocana-node/commit/b764f7006a4a99a3f19c543ebddba0575e26df52))


### Code Refactoring

* **cli:** add runAndParse and waitWithStderr methods ([#414](https://github.com/oomol/oocana-node/issues/414)) ([025f09d](https://github.com/oomol/oocana-node/commit/025f09d1fde821f88665da465e0e41427d54c215))
* **oocana:** clean up FlowConfig and BlockConfig public API ([#420](https://github.com/oomol/oocana-node/issues/420)) ([93719d6](https://github.com/oomol/oocana-node/commit/93719d6b2ef567b9b6d3c9e0a49d1d7314a95ed9))
* **oocana:** extract common execution logic from runBlock/runFlow ([#413](https://github.com/oomol/oocana-node/issues/413)) ([001b9c0](https://github.com/oomol/oocana-node/commit/001b9c0cd1f1a4d2fc62622ba50fc21f596104ef))
* **oocana:** improve type safety for public APIs ([#416](https://github.com/oomol/oocana-node/issues/416)) ([59a98c9](https://github.com/oomol/oocana-node/commit/59a98c96f3c4d5852ff06784069dbf45dafcc4ec))
* **oocana:** replace bindPaths string[] with structured BindPath type ([#419](https://github.com/oomol/oocana-node/issues/419)) ([405ac86](https://github.com/oomol/oocana-node/commit/405ac86c95b565e64e403d18b1d9df3f8bb5990f))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.34 ([#418](https://github.com/oomol/oocana-node/issues/418)) ([22b292a](https://github.com/oomol/oocana-node/commit/22b292a0d64c588fa634ad4c4d26741b466da435))

## [0.23.36](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.35...@oomol/oocana-v0.23.36) (2026-01-28)


### Bug Fixes

* cli exit code ([#411](https://github.com/oomol/oocana-node/issues/411)) ([0e3ddf1](https://github.com/oomol/oocana-node/commit/0e3ddf120be71c449a3263883d6711498d2383bf))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.33 ([#409](https://github.com/oomol/oocana-node/issues/409)) ([fe28398](https://github.com/oomol/oocana-node/commit/fe2839850e1b97c7db6c6c2af586fcd77fd15279))

## [0.23.35](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.34...@oomol/oocana-v0.23.35) (2026-01-22)


### Bug Fixes

* pass process.env to child process ([#407](https://github.com/oomol/oocana-node/issues/407)) ([c2d2cb8](https://github.com/oomol/oocana-node/commit/c2d2cb86c56b2f58d33f0bf1860f334339b124ca))

## [0.23.34](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.33...@oomol/oocana-v0.23.34) (2026-01-22)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.31 ([#405](https://github.com/oomol/oocana-node/issues/405)) ([04d6e2f](https://github.com/oomol/oocana-node/commit/04d6e2f3b690c99795eedc715323f579e525b2f9))

## [0.23.33](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.32...@oomol/oocana-v0.23.33) (2026-01-19)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.29 ([#403](https://github.com/oomol/oocana-node/issues/403)) ([4be7bec](https://github.com/oomol/oocana-node/commit/4be7bec38abb47a0c8f70859c5c9ecf97564f90f))

## [0.23.32](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.31...@oomol/oocana-v0.23.32) (2026-01-16)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.27 ([#401](https://github.com/oomol/oocana-node/issues/401)) ([593f270](https://github.com/oomol/oocana-node/commit/593f2701e9be434e28d6a77f409cef6c8624527a))

## [0.23.31](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.30...@oomol/oocana-v0.23.31) (2026-01-15)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.26 ([#399](https://github.com/oomol/oocana-node/issues/399)) ([147c44a](https://github.com/oomol/oocana-node/commit/147c44aebdd87b2896aa5cbdbacc4c97e9b36480))

## [0.23.30](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.29...@oomol/oocana-v0.23.30) (2026-01-15)


### Features

* enhance checkPackageLayer to accept packageName and version parameters ([#398](https://github.com/oomol/oocana-node/issues/398)) ([cbf6179](https://github.com/oomol/oocana-node/commit/cbf6179d2c882f196af4224ceb9fdb30410b0507))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.25 ([#396](https://github.com/oomol/oocana-node/issues/396)) ([6937253](https://github.com/oomol/oocana-node/commit/69372532fa140991a915eb1b6b39b7b2bb54ddfa))

## [0.23.29](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.28...@oomol/oocana-v0.23.29) (2025-12-23)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.23 ([#394](https://github.com/oomol/oocana-node/issues/394)) ([eb4b4f5](https://github.com/oomol/oocana-node/commit/eb4b4f58cd81022c309bb8a7828c6bab413d5343))

## [0.23.28](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.27...@oomol/oocana-v0.23.28) (2025-11-07)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.7

## [0.23.27](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.26...@oomol/oocana-v0.23.27) (2025-10-29)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.22 ([#391](https://github.com/oomol/oocana-node/issues/391)) ([3a7cac5](https://github.com/oomol/oocana-node/commit/3a7cac56a511e006109bbf640f5325b17310eef1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.6

## [0.23.26](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.25...@oomol/oocana-v0.23.26) (2025-10-10)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.5

## [0.23.25](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.24...@oomol/oocana-v0.23.25) (2025-10-10)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.4

## [0.23.24](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.23...@oomol/oocana-v0.23.24) (2025-09-23)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.21 ([#380](https://github.com/oomol/oocana-node/issues/380)) ([34c7649](https://github.com/oomol/oocana-node/commit/34c76499ed726c9ad74b7d329656b7e9f8a06c9b))

## [0.23.23](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.22...@oomol/oocana-v0.23.23) (2025-09-23)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.3

## [0.23.22](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.21...@oomol/oocana-v0.23.22) (2025-09-18)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.20 ([#375](https://github.com/oomol/oocana-node/issues/375)) ([dd52da3](https://github.com/oomol/oocana-node/commit/dd52da3e018728d61ab8c1056d628ba5c9ab28ab))

## [0.23.21](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.20...@oomol/oocana-v0.23.21) (2025-09-12)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.19 ([#373](https://github.com/oomol/oocana-node/issues/373)) ([73cd88c](https://github.com/oomol/oocana-node/commit/73cd88c0bd614221bef4ec222a74dff0bc9ac83a))

## [0.23.20](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.19...@oomol/oocana-v0.23.20) (2025-09-10)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.18 ([#371](https://github.com/oomol/oocana-node/issues/371)) ([4be2d06](https://github.com/oomol/oocana-node/commit/4be2d0674850711e82af9638cfc961f1757083e6))

## [0.23.19](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.18...@oomol/oocana-v0.23.19) (2025-09-10)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.17 ([#369](https://github.com/oomol/oocana-node/issues/369)) ([1d010dd](https://github.com/oomol/oocana-node/commit/1d010dde364717da0abd9fe110d13a12045e2e3c))

## [0.23.18](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.17...@oomol/oocana-v0.23.18) (2025-09-06)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.16 ([#366](https://github.com/oomol/oocana-node/issues/366)) ([0c05a56](https://github.com/oomol/oocana-node/commit/0c05a569b0b4314d48faea25539a610248f700d8))

## [0.23.17](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.16...@oomol/oocana-v0.23.17) (2025-09-04)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.15 ([#364](https://github.com/oomol/oocana-node/issues/364)) ([6c9cad6](https://github.com/oomol/oocana-node/commit/6c9cad6c474f023420cee7c3cd4e774003182273))

## [0.23.16](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.15...@oomol/oocana-v0.23.16) (2025-09-02)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.14 ([#362](https://github.com/oomol/oocana-node/issues/362)) ([d292ebc](https://github.com/oomol/oocana-node/commit/d292ebcd1b1f24f8cdae0465bf5acbd14834bc93))

## [0.23.15](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.14...@oomol/oocana-v0.23.15) (2025-08-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.2

## [0.23.14](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.13...@oomol/oocana-v0.23.14) (2025-08-26)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.1

## [0.23.13](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.12...@oomol/oocana-v0.23.13) (2025-08-19)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.12 ([#352](https://github.com/oomol/oocana-node/issues/352)) ([405acc3](https://github.com/oomol/oocana-node/commit/405acc389985974db3b7bd7b3220ced9d228c2b6))

## [0.23.12](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.11...@oomol/oocana-v0.23.12) (2025-08-16)


### Code Refactoring

* reduce same logic code ([#347](https://github.com/oomol/oocana-node/issues/347)) ([161ce6e](https://github.com/oomol/oocana-node/commit/161ce6e516d153c54a0c46cc9fe33b454a05696b))
* use composition instead inheritance ([#349](https://github.com/oomol/oocana-node/issues/349)) ([d8e6b60](https://github.com/oomol/oocana-node/commit/d8e6b600878e764d3a23fac3fc9a67a49a413597))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.11 ([#350](https://github.com/oomol/oocana-node/issues/350)) ([68f91e5](https://github.com/oomol/oocana-node/commit/68f91e5aa0f7c9a5a41c78a08671b0950157efce))

## [0.23.11](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.10...@oomol/oocana-v0.23.11) (2025-08-11)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.10 ([#344](https://github.com/oomol/oocana-node/issues/344)) ([34d7acc](https://github.com/oomol/oocana-node/commit/34d7acc33cce83eeea5a0454f0dad8412d483d60))

## [0.23.10](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.9...@oomol/oocana-v0.23.10) (2025-08-07)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.8 ([#342](https://github.com/oomol/oocana-node/issues/342)) ([bbe5f5c](https://github.com/oomol/oocana-node/commit/bbe5f5c3f3786e2887b1153e53324efefb918e93))

## [0.23.9](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.8...@oomol/oocana-v0.23.9) (2025-08-05)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.7 ([#340](https://github.com/oomol/oocana-node/issues/340)) ([8666f3d](https://github.com/oomol/oocana-node/commit/8666f3dc9948f9129cd6d752d388c44a4c67dc6c))

## [0.23.8](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.7...@oomol/oocana-v0.23.8) (2025-08-04)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.6 ([#338](https://github.com/oomol/oocana-node/issues/338)) ([e49c923](https://github.com/oomol/oocana-node/commit/e49c923822198cceff9368e99f2337076f70ce59))

## [0.23.7](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.6...@oomol/oocana-v0.23.7) (2025-08-04)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.5 ([#336](https://github.com/oomol/oocana-node/issues/336)) ([37ab437](https://github.com/oomol/oocana-node/commit/37ab4375ec5ac52b00c184c8e5ec52342b56c5ab))

## [0.23.6](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.5...@oomol/oocana-v0.23.6) (2025-08-02)


### Features

* add oocana to bin ([#313](https://github.com/oomol/oocana-node/issues/313)) ([cdd967a](https://github.com/oomol/oocana-node/commit/cdd967a42c20bc4b08a7d08e4a2d9c689d01ec95))
* add oocana to bin ([#313](https://github.com/oomol/oocana-node/issues/313)) ([#315](https://github.com/oomol/oocana-node/issues/315)) ([4142a61](https://github.com/oomol/oocana-node/commit/4142a613ecee19ab5d43344ec7d74ff176e25ada))
* add oocana to bin ([#319](https://github.com/oomol/oocana-node/issues/319)) ([bfdee1b](https://github.com/oomol/oocana-node/commit/bfdee1b201229e1e1e7a13a463f4923a52411e0b))
* remove bin ([#322](https://github.com/oomol/oocana-node/issues/322)) ([6590eb9](https://github.com/oomol/oocana-node/commit/6590eb904f5306e82b60550f35bc10a57cd6d687))


### Bug Fixes

* exit if enoent ([#323](https://github.com/oomol/oocana-node/issues/323)) ([02eb864](https://github.com/oomol/oocana-node/commit/02eb864da82e5ab8de21e71521ccaf69cde7c587))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.2 ([#317](https://github.com/oomol/oocana-node/issues/317)) ([1f75de9](https://github.com/oomol/oocana-node/commit/1f75de9ebd2e26b7ca866029ef3e21612e2e9a73))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.3 ([#320](https://github.com/oomol/oocana-node/issues/320)) ([fa30459](https://github.com/oomol/oocana-node/commit/fa30459a925391d37960d2028de032f3b62bfd02))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.4 ([#327](https://github.com/oomol/oocana-node/issues/327)) ([e7fce30](https://github.com/oomol/oocana-node/commit/e7fce30fa7455001566ea58d207de0c921802a82))

## [0.23.5](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.4...@oomol/oocana-v0.23.5) (2025-08-02)


### Bug Fixes

* exit if enoent ([#323](https://github.com/oomol/oocana-node/issues/323)) ([02eb864](https://github.com/oomol/oocana-node/commit/02eb864da82e5ab8de21e71521ccaf69cde7c587))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.4 ([#327](https://github.com/oomol/oocana-node/issues/327)) ([e7fce30](https://github.com/oomol/oocana-node/commit/e7fce30fa7455001566ea58d207de0c921802a82))

## [0.23.4](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.3...@oomol/oocana-v0.23.4) (2025-08-02)


### Features

* remove bin ([#322](https://github.com/oomol/oocana-node/issues/322)) ([6590eb9](https://github.com/oomol/oocana-node/commit/6590eb904f5306e82b60550f35bc10a57cd6d687))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.3 ([#320](https://github.com/oomol/oocana-node/issues/320)) ([fa30459](https://github.com/oomol/oocana-node/commit/fa30459a925391d37960d2028de032f3b62bfd02))

## [0.23.3](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.2...@oomol/oocana-v0.23.3) (2025-08-01)


### Features

* add oocana to bin ([#319](https://github.com/oomol/oocana-node/issues/319)) ([bfdee1b](https://github.com/oomol/oocana-node/commit/bfdee1b201229e1e1e7a13a463f4923a52411e0b))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.30.2 ([#317](https://github.com/oomol/oocana-node/issues/317)) ([1f75de9](https://github.com/oomol/oocana-node/commit/1f75de9ebd2e26b7ca866029ef3e21612e2e9a73))

## [0.23.2](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.1...@oomol/oocana-v0.23.2) (2025-07-31)


### Features

* add oocana to bin ([#313](https://github.com/oomol/oocana-node/issues/313)) ([#315](https://github.com/oomol/oocana-node/issues/315)) ([4142a61](https://github.com/oomol/oocana-node/commit/4142a613ecee19ab5d43344ec7d74ff176e25ada))

## [0.23.1](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.23.0...@oomol/oocana-v0.23.1) (2025-07-31)


### Features

* add oocana to bin ([#313](https://github.com/oomol/oocana-node/issues/313)) ([cdd967a](https://github.com/oomol/oocana-node/commit/cdd967a42c20bc4b08a7d08e4a2d9c689d01ec95))

## [0.23.0](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.66...@oomol/oocana-v0.23.0) (2025-07-29)


### ⚠ BREAKING CHANGES

* add query inputs and rename origin input to nodes_inputs ([#309](https://github.com/oomol/oocana-node/issues/309))

### Features

* add query inputs and rename origin input to nodes_inputs ([#309](https://github.com/oomol/oocana-node/issues/309)) ([da4cc26](https://github.com/oomol/oocana-node/commit/da4cc2650c6bcd34c84cad34b14a9582791f1c2a))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.19 ([#311](https://github.com/oomol/oocana-node/issues/311)) ([52a9f79](https://github.com/oomol/oocana-node/commit/52a9f79b028c9fa67b4bbccf860173ca52d6a86c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.23.0

## [0.22.66](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.65...@oomol/oocana-v0.22.66) (2025-07-28)


### Features

* add search paths parameter for run block ([#305](https://github.com/oomol/oocana-node/issues/305)) ([6906b96](https://github.com/oomol/oocana-node/commit/6906b962ccbe215bd761d6c7cfee14f13bbf223c))

## [0.22.65](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.64...@oomol/oocana-v0.22.65) (2025-07-28)


### Features

* add run block api ([#299](https://github.com/oomol/oocana-node/issues/299)) ([4f7d5cc](https://github.com/oomol/oocana-node/commit/4f7d5cc163faa18edaa5688c6b2911163ad18f2a))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.15 ([#300](https://github.com/oomol/oocana-node/issues/300)) ([5daf8c1](https://github.com/oomol/oocana-node/commit/5daf8c155e0682fcf2223897028028e704279b2d))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.17 ([#302](https://github.com/oomol/oocana-node/issues/302)) ([dbddff4](https://github.com/oomol/oocana-node/commit/dbddff4dea2ed4264a46ffd95081d1c7c564c306))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.18 ([#303](https://github.com/oomol/oocana-node/issues/303)) ([2f1a593](https://github.com/oomol/oocana-node/commit/2f1a593477156dab315432db65dd8b5d8249a609))

## [0.22.64](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.63...@oomol/oocana-v0.22.64) (2025-07-26)


### Code Refactoring

* add client format to better distinguish ([#293](https://github.com/oomol/oocana-node/issues/293)) ([e8b5099](https://github.com/oomol/oocana-node/commit/e8b50992898988094509b5df60b4c51976466457))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.13 ([#294](https://github.com/oomol/oocana-node/issues/294)) ([25f1013](https://github.com/oomol/oocana-node/commit/25f10135b20c4462a2a7cc408d6a0d94aeabb408))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.14 ([#295](https://github.com/oomol/oocana-node/issues/295)) ([9ff2e3c](https://github.com/oomol/oocana-node/commit/9ff2e3c5371cd59c835330ef012367786157d482))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.5

## [0.22.63](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.62...@oomol/oocana-v0.22.63) (2025-07-25)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.12 ([#288](https://github.com/oomol/oocana-node/issues/288)) ([6fbddfb](https://github.com/oomol/oocana-node/commit/6fbddfb086f164ccb447de92c49a62624f2d694f))

## [0.22.62](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.61...@oomol/oocana-v0.22.62) (2025-07-24)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.11 ([#286](https://github.com/oomol/oocana-node/issues/286)) ([53cac16](https://github.com/oomol/oocana-node/commit/53cac16b3550fa9a5556d6d287b35641f03d986f))

## [0.22.61](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.60...@oomol/oocana-v0.22.61) (2025-07-24)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.10 ([#284](https://github.com/oomol/oocana-node/issues/284)) ([3f004e6](https://github.com/oomol/oocana-node/commit/3f004e6cef0bb53ab31c23b0f47c8d781727b884))

## [0.22.60](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.59...@oomol/oocana-v0.22.60) (2025-07-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.9 ([#282](https://github.com/oomol/oocana-node/issues/282)) ([5319332](https://github.com/oomol/oocana-node/commit/531933249a6b47da802767ac570b13bfec81de49))

## [0.22.59](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.58...@oomol/oocana-v0.22.59) (2025-07-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.8 ([#280](https://github.com/oomol/oocana-node/issues/280)) ([f05735a](https://github.com/oomol/oocana-node/commit/f05735ab529f49abb826ddebf40bce9817f36d7a))

## [0.22.58](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.57...@oomol/oocana-v0.22.58) (2025-07-19)


### Features

* add projectData pkgDataRoot require ([#276](https://github.com/oomol/oocana-node/issues/276)) ([9691301](https://github.com/oomol/oocana-node/commit/9691301ccd7f39a43317a09d70a5bd777044f95c))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.7 ([#277](https://github.com/oomol/oocana-node/issues/277)) ([ee193b4](https://github.com/oomol/oocana-node/commit/ee193b4dfd365f98a82aa73f5aaddaecba9eb462))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.4

## [0.22.57](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.56...@oomol/oocana-v0.22.57) (2025-07-18)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.5 ([#266](https://github.com/oomol/oocana-node/issues/266)) ([0fdcdb1](https://github.com/oomol/oocana-node/commit/0fdcdb1b451ff8eddac5b46d3abcd0b5309a9537))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.6 ([#269](https://github.com/oomol/oocana-node/issues/269)) ([f21cc15](https://github.com/oomol/oocana-node/commit/f21cc15f019c40e7a4bb5b36c2703a9762b31490))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.3

## [0.22.56](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.55...@oomol/oocana-v0.22.56) (2025-07-17)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.4 ([#264](https://github.com/oomol/oocana-node/issues/264)) ([eaae6f4](https://github.com/oomol/oocana-node/commit/eaae6f4b1d98e813be3e9497418c3d3373081cdb))

## [0.22.55](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.54...@oomol/oocana-v0.22.55) (2025-07-16)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.3 ([#261](https://github.com/oomol/oocana-node/issues/261)) ([358303f](https://github.com/oomol/oocana-node/commit/358303f2e162d47e61d2c79fe0940b2aa753192a))

## [0.22.54](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.53...@oomol/oocana-v0.22.54) (2025-07-16)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.2

## [0.22.53](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.52...@oomol/oocana-v0.22.53) (2025-07-16)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.2 ([#258](https://github.com/oomol/oocana-node/issues/258)) ([a905a8e](https://github.com/oomol/oocana-node/commit/a905a8e0a33a1a12585f291c51fda529b4cf241c))

## [0.22.52](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.51...@oomol/oocana-v0.22.52) (2025-07-15)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.1 ([#255](https://github.com/oomol/oocana-node/issues/255)) ([ab878ca](https://github.com/oomol/oocana-node/commit/ab878caec68d71d4400b7f274537ecfad6791f02))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.1

## [0.22.51](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.50...@oomol/oocana-v0.22.51) (2025-07-15)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.29.0 ([#252](https://github.com/oomol/oocana-node/issues/252)) ([f0384d4](https://github.com/oomol/oocana-node/commit/f0384d483f6154bc88b197dcf98c1bc01b717d66))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.22.0

## [0.22.50](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.49...@oomol/oocana-v0.22.50) (2025-07-13)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.21.2

## [0.22.49](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.48...@oomol/oocana-v0.22.49) (2025-07-11)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.27 ([#243](https://github.com/oomol/oocana-node/issues/243)) ([4e86a5f](https://github.com/oomol/oocana-node/commit/4e86a5fd58f5c3db9a5f176f957812c99d64c957))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.21.1

## [0.22.48](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.47...@oomol/oocana-v0.22.48) (2025-07-10)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.26 ([#238](https://github.com/oomol/oocana-node/issues/238)) ([0b4139f](https://github.com/oomol/oocana-node/commit/0b4139f8d759b4f8008cbe1dff314971a968863b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.21.0

## [0.22.47](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.46...@oomol/oocana-v0.22.47) (2025-07-08)


### Features

* add run block api ([#228](https://github.com/oomol/oocana-node/issues/228)) ([6aa517d](https://github.com/oomol/oocana-node/commit/6aa517dcbf1ec6ae298c86ddc4ee78f3d0d13853))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.25 ([#234](https://github.com/oomol/oocana-node/issues/234)) ([6a048a3](https://github.com/oomol/oocana-node/commit/6a048a34bb5ad0b3fb5113d9b34b12300755ab52))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.46

## [0.22.46](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.45...@oomol/oocana-v0.22.46) (2025-07-07)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.45

## [0.22.45](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.44...@oomol/oocana-v0.22.45) (2025-07-07)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.44

## [0.22.44](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.43...@oomol/oocana-v0.22.44) (2025-07-02)


### Features

* update parameter types ([#226](https://github.com/oomol/oocana-node/issues/226)) ([965dc0c](https://github.com/oomol/oocana-node/commit/965dc0c6e93157bb116d7cdfe4f3e7fef4ceadd1))

## [0.22.43](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.42...@oomol/oocana-v0.22.43) (2025-07-02)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.24 ([#224](https://github.com/oomol/oocana-node/issues/224)) ([032b15b](https://github.com/oomol/oocana-node/commit/032b15b47343fc6020d49aa57a738d94a3272b6a))

## [0.22.42](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.41...@oomol/oocana-v0.22.42) (2025-07-01)


### Features

* export query input type ([#222](https://github.com/oomol/oocana-node/issues/222)) ([3e4b1af](https://github.com/oomol/oocana-node/commit/3e4b1af6c9f06c99a31aecf9ce122ae1bb2deb43))

## [0.22.41](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.40...@oomol/oocana-v0.22.41) (2025-07-01)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.23 ([#220](https://github.com/oomol/oocana-node/issues/220)) ([01fbd42](https://github.com/oomol/oocana-node/commit/01fbd42ed2ddcdef4d2dde768a4dcb03a9492ea6))

## [0.22.40](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.39...@oomol/oocana-v0.22.40) (2025-07-01)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.22 ([#219](https://github.com/oomol/oocana-node/issues/219)) ([00cfac9](https://github.com/oomol/oocana-node/commit/00cfac9cbf6027ac3defac7fac74e45b0c5b6899))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.43

## [0.22.39](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.38...@oomol/oocana-v0.22.39) (2025-06-30)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.21 ([#213](https://github.com/oomol/oocana-node/issues/213)) ([4f191d2](https://github.com/oomol/oocana-node/commit/4f191d22b1db5f8be52dc2d556ef2827237d4554))

## [0.22.38](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.37...@oomol/oocana-v0.22.38) (2025-06-27)


### Features

* add query input api ([#212](https://github.com/oomol/oocana-node/issues/212)) ([d4196f2](https://github.com/oomol/oocana-node/commit/d4196f255818cca3a206b8de0b057921950e1846))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.20 ([#210](https://github.com/oomol/oocana-node/issues/210)) ([a66d523](https://github.com/oomol/oocana-node/commit/a66d523b22594a3478ba0b341b9d3cd91ad923b2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.42

## [0.22.37](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.36...@oomol/oocana-v0.22.37) (2025-06-26)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.19 ([#208](https://github.com/oomol/oocana-node/issues/208)) ([4044d98](https://github.com/oomol/oocana-node/commit/4044d980ad43ec06c1e511666ea9b672e0aac327))

## [0.22.36](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.35...@oomol/oocana-v0.22.36) (2025-06-25)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.18 ([#204](https://github.com/oomol/oocana-node/issues/204)) ([4999057](https://github.com/oomol/oocana-node/commit/49990578e9ea0378ccf831a23376d906d062344a))

## [0.22.35](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.34...@oomol/oocana-v0.22.35) (2025-06-24)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.17 ([#201](https://github.com/oomol/oocana-node/issues/201)) ([9c33659](https://github.com/oomol/oocana-node/commit/9c33659d9d60c92e4e5ed2b5f67dea717cd9bd2b))

## [0.22.34](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.33...@oomol/oocana-v0.22.34) (2025-06-24)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.15 ([#193](https://github.com/oomol/oocana-node/issues/193)) ([50dbba4](https://github.com/oomol/oocana-node/commit/50dbba4673b353a4de5404a07f7f0c0d2f6a544e))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.16 ([#199](https://github.com/oomol/oocana-node/issues/199)) ([6857e28](https://github.com/oomol/oocana-node/commit/6857e2863a1d8b0e9f3f7b05f5b161061bd898ba))

## [0.22.33](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.32...@oomol/oocana-v0.22.33) (2025-06-19)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.14 ([#188](https://github.com/oomol/oocana-node/issues/188)) ([a576ee1](https://github.com/oomol/oocana-node/commit/a576ee187a76e9aa56531eef56f78b9035204d81))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.41

## [0.22.32](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.31...@oomol/oocana-v0.22.32) (2025-06-19)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.12 ([#186](https://github.com/oomol/oocana-node/issues/186)) ([6ad05e2](https://github.com/oomol/oocana-node/commit/6ad05e2c1f806c3704f2b18340300a4fb4a7f199))

## [0.22.31](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.30...@oomol/oocana-v0.22.31) (2025-06-18)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.11 ([#184](https://github.com/oomol/oocana-node/issues/184)) ([bd8503b](https://github.com/oomol/oocana-node/commit/bd8503bef00b15634c18b161a4daa96b28d1abee))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.40

## [0.22.30](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.29...@oomol/oocana-v0.22.30) (2025-06-18)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.10 ([#181](https://github.com/oomol/oocana-node/issues/181)) ([bc851a2](https://github.com/oomol/oocana-node/commit/bc851a2bd47bc0bf57c5ce410ef7977001c7724c))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.9 ([#179](https://github.com/oomol/oocana-node/issues/179)) ([884c443](https://github.com/oomol/oocana-node/commit/884c443c96c6a826d76cef4afdc573ff469bf59a))

## [0.22.29](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.28...@oomol/oocana-v0.22.29) (2025-06-12)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.8 ([#175](https://github.com/oomol/oocana-node/issues/175)) ([9d82a2c](https://github.com/oomol/oocana-node/commit/9d82a2ca05bb059e0aed2f355f577dac12e68075))

## [0.22.28](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.27...@oomol/oocana-v0.22.28) (2025-06-10)


### Features

* pass process env to spawned ([#173](https://github.com/oomol/oocana-node/issues/173)) ([7088c82](https://github.com/oomol/oocana-node/commit/7088c82835b2c5f03c094391446eaf71f2692af6))

## [0.22.27](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.26...@oomol/oocana-v0.22.27) (2025-06-06)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.39

## [0.22.26](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.25...@oomol/oocana-v0.22.26) (2025-06-03)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.7 ([#167](https://github.com/oomol/oocana-node/issues/167)) ([9ceb13c](https://github.com/oomol/oocana-node/commit/9ceb13c5182e52dc3164d902f4798e339152c2eb))

## [0.22.25](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.24...@oomol/oocana-v0.22.25) (2025-05-30)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.6 ([#165](https://github.com/oomol/oocana-node/issues/165)) ([3892ed9](https://github.com/oomol/oocana-node/commit/3892ed9a2b670f2f1ea0ab1addec723ec824bc72))

## [0.22.24](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.23...@oomol/oocana-v0.22.24) (2025-05-30)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.5 ([#162](https://github.com/oomol/oocana-node/issues/162)) ([978ae07](https://github.com/oomol/oocana-node/commit/978ae074d41d0bd2423a248631341571aa7692f6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.38

## [0.22.23](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.22...@oomol/oocana-v0.22.23) (2025-05-29)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.4 ([#157](https://github.com/oomol/oocana-node/issues/157)) ([018dfc9](https://github.com/oomol/oocana-node/commit/018dfc930c4b48ce922864132277143eb1dc8a3a))

## [0.22.22](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.21...@oomol/oocana-v0.22.22) (2025-05-28)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.3 ([#151](https://github.com/oomol/oocana-node/issues/151)) ([bdf26da](https://github.com/oomol/oocana-node/commit/bdf26da906986baf2039bf62e3428ff79dfb5ca8))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.37

## [0.22.21](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.20...@oomol/oocana-v0.22.21) (2025-05-27)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.2 ([#149](https://github.com/oomol/oocana-node/issues/149)) ([0e09350](https://github.com/oomol/oocana-node/commit/0e09350ba4a9c476e6d55395f1ef22d6568a0966))

## [0.22.20](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.19...@oomol/oocana-v0.22.20) (2025-05-26)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.1 ([#146](https://github.com/oomol/oocana-node/issues/146)) ([fb0668b](https://github.com/oomol/oocana-node/commit/fb0668b74b2e7143e06cd2de3ec3558f39f3115c))

## [0.22.19](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.18...@oomol/oocana-v0.22.19) (2025-05-23)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.28.0 ([#145](https://github.com/oomol/oocana-node/issues/145)) ([bd58d90](https://github.com/oomol/oocana-node/commit/bd58d9068dac8bb0e49b745bb0d0ce360b1bebfe))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.36

## [0.22.18](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.17...@oomol/oocana-v0.22.18) (2025-05-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.18 ([#138](https://github.com/oomol/oocana-node/issues/138)) ([854a60b](https://github.com/oomol/oocana-node/commit/854a60ba0dc24e76c831ed0682186a544b8a6281))

## [0.22.17](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.16...@oomol/oocana-v0.22.17) (2025-05-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.35

## [0.22.16](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.15...@oomol/oocana-v0.22.16) (2025-05-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.15 ([#130](https://github.com/oomol/oocana-node/issues/130)) ([8211e95](https://github.com/oomol/oocana-node/commit/8211e95391c9136e0b8f93ecba5aeb6afe09c194))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.16 ([#133](https://github.com/oomol/oocana-node/issues/133)) ([6df3998](https://github.com/oomol/oocana-node/commit/6df39982f09a6b9c4af4595f22e98f5764d93b30))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.17 ([#134](https://github.com/oomol/oocana-node/issues/134)) ([7fed9ee](https://github.com/oomol/oocana-node/commit/7fed9ee96ab17fc2adda69f45090a6a722764e13))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.34

## [0.22.15](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.14...@oomol/oocana-v0.22.15) (2025-05-15)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.14 ([#128](https://github.com/oomol/oocana-node/issues/128)) ([2cc5b7d](https://github.com/oomol/oocana-node/commit/2cc5b7de93e40fb9b4d7c221e837c06e88369d43))

## [0.22.14](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.13...@oomol/oocana-v0.22.14) (2025-05-15)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.13 ([#126](https://github.com/oomol/oocana-node/issues/126)) ([42d8513](https://github.com/oomol/oocana-node/commit/42d8513fcaa271eb1a210f1ad6d2a3fc47a76841))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.33

## [0.22.13](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.12...@oomol/oocana-v0.22.13) (2025-05-14)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.12 ([#121](https://github.com/oomol/oocana-node/issues/121)) ([91ec2ab](https://github.com/oomol/oocana-node/commit/91ec2ab3648bb344405e26e43058c7ca679bfac1))

## [0.22.12](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.11...@oomol/oocana-v0.22.12) (2025-05-13)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.11 ([#115](https://github.com/oomol/oocana-node/issues/115)) ([b3cad66](https://github.com/oomol/oocana-node/commit/b3cad66e439b5d6d2598baca94a93a5d40eedec3))

## [0.22.11](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.10...@oomol/oocana-v0.22.11) (2025-05-10)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.10 ([#105](https://github.com/oomol/oocana-node/issues/105)) ([f08b29a](https://github.com/oomol/oocana-node/commit/f08b29af74f8bd9ed49be03935a6452a937d1b39))

## [0.22.10](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.9...@oomol/oocana-v0.22.10) (2025-05-09)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.9 ([#103](https://github.com/oomol/oocana-node/issues/103)) ([caabb2f](https://github.com/oomol/oocana-node/commit/caabb2f252c95adeeb27847005609b1e21a78d54))

## [0.22.9](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.8...@oomol/oocana-v0.22.9) (2025-05-09)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.8 ([#100](https://github.com/oomol/oocana-node/issues/100)) ([2670aee](https://github.com/oomol/oocana-node/commit/2670aeeffbadc4f2cc58a77b37519e5479ec90aa))

## [0.22.8](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.7...@oomol/oocana-v0.22.8) (2025-05-08)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.7 ([#97](https://github.com/oomol/oocana-node/issues/97)) ([13cc6e1](https://github.com/oomol/oocana-node/commit/13cc6e183b144f9f6eaf69e08e44193751dc579c))

## [0.22.7](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.6...@oomol/oocana-v0.22.7) (2025-05-08)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.6 ([#95](https://github.com/oomol/oocana-node/issues/95)) ([d1d124a](https://github.com/oomol/oocana-node/commit/d1d124afd34c4348bb14ca8555c0211a6b736882))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.32

## [0.22.6](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.5...@oomol/oocana-v0.22.6) (2025-05-07)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.5 ([#87](https://github.com/oomol/oocana-node/issues/87)) ([e028d23](https://github.com/oomol/oocana-node/commit/e028d23ef3e166053440f18fce2d3482837ddddb))

## [0.22.5](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.4...@oomol/oocana-v0.22.5) (2025-05-06)


### Code Refactoring

* extract env pass through logic ([#81](https://github.com/oomol/oocana-node/issues/81)) ([41d2ca3](https://github.com/oomol/oocana-node/commit/41d2ca34aa13436e92a80df621d32d4d6def289a))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.3 ([#84](https://github.com/oomol/oocana-node/issues/84)) ([aa73f4b](https://github.com/oomol/oocana-node/commit/aa73f4b082e23937814e27e7eac90b3345338bbe))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.4 ([#86](https://github.com/oomol/oocana-node/issues/86)) ([a65aad7](https://github.com/oomol/oocana-node/commit/a65aad7cff9a0968224225829100844a4ec297a7))

## [0.22.4](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.3...@oomol/oocana-v0.22.4) (2025-04-29)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.1 ([#72](https://github.com/oomol/oocana-node/issues/72)) ([1c1a022](https://github.com/oomol/oocana-node/commit/1c1a022ed5e70c62a4c45159c278f2526ac5c45d))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.2 ([#79](https://github.com/oomol/oocana-node/issues/79)) ([ccf6689](https://github.com/oomol/oocana-node/commit/ccf6689368fb9a7ab0e3e7672ab739bec2c747f3))

## [0.22.3](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.2...@oomol/oocana-v0.22.3) (2025-04-18)


### Bug Fixes

* missing path ([#68](https://github.com/oomol/oocana-node/issues/68)) ([ed13b37](https://github.com/oomol/oocana-node/commit/ed13b37fe1a9686741f97304b4cf6bd55558c003))

## [0.22.2](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.1...@oomol/oocana-v0.22.2) (2025-04-18)


### Bug Fixes

* wrong parameters ([#66](https://github.com/oomol/oocana-node/issues/66)) ([32fad5e](https://github.com/oomol/oocana-node/commit/32fad5ef492b8f44f7ccaab6a26b01f00e5e6724))

## [0.22.1](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.22.0...@oomol/oocana-v0.22.1) (2025-04-17)


### Features

* add envs for create layer api ([#62](https://github.com/oomol/oocana-node/issues/62)) ([306c680](https://github.com/oomol/oocana-node/commit/306c680a26ab02fbb30824965433f355fcd409c8))

## [0.22.0](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.38...@oomol/oocana-v0.22.0) (2025-04-10)


### ⚠ BREAKING CHANGES

* rename blockSearchPaths to searchPaths ([#61](https://github.com/oomol/oocana-node/issues/61))
* fix bind path check ([#60](https://github.com/oomol/oocana-node/issues/60))

### Features

* fix bind path check ([#60](https://github.com/oomol/oocana-node/issues/60)) ([2bc8a6e](https://github.com/oomol/oocana-node/commit/2bc8a6ef91aee881320dbe5b92d6f675fc598e3c))
* rename blockSearchPaths to searchPaths ([#61](https://github.com/oomol/oocana-node/issues/61)) ([fb42dad](https://github.com/oomol/oocana-node/commit/fb42dad2c14d87ee6a2a4818cac36b4d2ff99670))
* update bind paths ([#59](https://github.com/oomol/oocana-node/issues/59)) ([f58ad23](https://github.com/oomol/oocana-node/commit/f58ad2344f9cb674db56865565d91bc41e9ae961))
* use new ovmlayer api and new bind path format ([#56](https://github.com/oomol/oocana-node/issues/56)) ([b8f704d](https://github.com/oomol/oocana-node/commit/b8f704dbe84e4719dc156b72c378440d9d8c55fc))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.27.0 ([#58](https://github.com/oomol/oocana-node/issues/58)) ([0c08bdc](https://github.com/oomol/oocana-node/commit/0c08bdc5b87629e5e2e1bf024b4f19057ff1df53))

## [0.21.38](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.37...@oomol/oocana-v0.21.38) (2025-04-08)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.5 ([#52](https://github.com/oomol/oocana-node/issues/52)) ([b29cbfc](https://github.com/oomol/oocana-node/commit/b29cbfc90525e6aad817274c76c215ee982ff045))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.6 ([#54](https://github.com/oomol/oocana-node/issues/54)) ([31d6ecc](https://github.com/oomol/oocana-node/commit/31d6ecc32a6dc353d6eea35fb5fb1c1cd6b95f79))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.7 ([#55](https://github.com/oomol/oocana-node/issues/55)) ([2c60230](https://github.com/oomol/oocana-node/commit/2c60230ef80e8ce4b61b4f92711929b29f93cbf1))

## [0.21.37](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.36...@oomol/oocana-v0.21.37) (2025-04-01)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.4 ([#50](https://github.com/oomol/oocana-node/issues/50)) ([ce7bae0](https://github.com/oomol/oocana-node/commit/ce7bae03d9975af104bb3c8d3ee0104566c069b0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.31

## [0.21.36](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.35...@oomol/oocana-v0.21.36) (2025-03-31)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.3 ([#43](https://github.com/oomol/oocana-node/issues/43)) ([438d6fd](https://github.com/oomol/oocana-node/commit/438d6fd7a2a75ee9bf168acb8149e30e4489afc4))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.30

## [0.21.35](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.34...@oomol/oocana-v0.21.35) (2025-03-28)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.1 ([#41](https://github.com/oomol/oocana-node/issues/41)) ([e8a46a9](https://github.com/oomol/oocana-node/commit/e8a46a9b928a92846f2c07f807e512b920c6830e))

## [0.21.34](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.33...@oomol/oocana-v0.21.34) (2025-03-26)


### Features

* pass OOCANA env ([#39](https://github.com/oomol/oocana-node/issues/39)) ([49519f5](https://github.com/oomol/oocana-node/commit/49519f5821e937b35382737172af23883d923aeb))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.29

## [0.21.33](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.32...@oomol/oocana-v0.21.33) (2025-03-26)


### Features

* add cli argument ([#36](https://github.com/oomol/oocana-node/issues/36)) ([b417e22](https://github.com/oomol/oocana-node/commit/b417e2260ead5ee875c49b49cd749aa7f3b92fcc))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.26.0 ([#34](https://github.com/oomol/oocana-node/issues/34)) ([591c1e4](https://github.com/oomol/oocana-node/commit/591c1e49305f72661cbda7bb551c044ccf20ba7e))

## [0.21.32](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.31...@oomol/oocana-v0.21.32) (2025-03-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.25.2 ([#31](https://github.com/oomol/oocana-node/issues/31)) ([7d74a40](https://github.com/oomol/oocana-node/commit/7d74a40936b87268e72fc99aa430ccdfe005b6ad))

## [0.21.31](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.30...@oomol/oocana-v0.21.31) (2025-03-21)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.25.1 ([#28](https://github.com/oomol/oocana-node/issues/28)) ([97ec639](https://github.com/oomol/oocana-node/commit/97ec6396a27343615d58ebf257b4fe7881453b58))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.28

## [0.21.30](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.29...@oomol/oocana-v0.21.30) (2025-03-20)


### Features

* add env file and bind path file for run flow and create layer api ([#26](https://github.com/oomol/oocana-node/issues/26)) ([aec4ebe](https://github.com/oomol/oocana-node/commit/aec4ebee1756d1fc78be8543d654d75e8d28fedd))
* remove remote option ([#25](https://github.com/oomol/oocana-node/issues/25)) ([2a68eaa](https://github.com/oomol/oocana-node/commit/2a68eaa01872c13ff0e7e32ec698392a0056b7ff))
* update [@oomol](https://github.com/oomol) packages to v0.25.0 and rename run flow parameters ([#23](https://github.com/oomol/oocana-node/issues/23)) ([83f2a5b](https://github.com/oomol/oocana-node/commit/83f2a5b2a52d17706b4b5b36f1bb17fd52f8b2db))

## [0.21.29](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.28...@oomol/oocana-v0.21.29) (2025-03-17)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.24.2 ([#19](https://github.com/oomol/oocana-node/issues/19)) ([9d651bf](https://github.com/oomol/oocana-node/commit/9d651bf723f3b5813170a20ff186861bf30823a1))

## [0.21.28](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.27...@oomol/oocana-v0.21.28) (2025-03-17)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.24.0 ([#12](https://github.com/oomol/oocana-node/issues/12)) ([924ed4e](https://github.com/oomol/oocana-node/commit/924ed4e8bdade2efc246577e2f401f381f2e8e49))
* **deps:** update [@oomol](https://github.com/oomol) packages to v0.24.1 ([#18](https://github.com/oomol/oocana-node/issues/18)) ([2c26492](https://github.com/oomol/oocana-node/commit/2c26492bf51f6ab9812d5e9c5a9fc71415a521b0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.27

## [0.21.27](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.26...@oomol/oocana-v0.21.27) (2025-03-12)


### Features

* remove sendSessionEnd ([0ac3278](https://github.com/oomol/oocana-node/commit/0ac32785279d8fa753c0d24ed3dda6fe8d25f241))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.23.4 ([#9](https://github.com/oomol/oocana-node/issues/9)) ([6315f93](https://github.com/oomol/oocana-node/commit/6315f93b510bf1c2140af4fbb2567dd817f86892))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @oomol/oocana-types bumped to 0.20.26

## [0.21.26](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.25...@oomol/oocana-v0.21.26) (2025-03-11)


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.23.3 ([#6](https://github.com/oomol/oocana-node/issues/6)) ([0ba5071](https://github.com/oomol/oocana-node/commit/0ba50719f184f25c394b1d4e87c66d9271cfc32f))

## [0.21.25](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.24...@oomol/oocana-v0.21.25) (2025-03-10)


### Features

* implement stop flow api ([#3](https://github.com/oomol/oocana-node/issues/3)) ([237c339](https://github.com/oomol/oocana-node/commit/237c3392992bb82dfdb5436b7c397e7aac87248a))


### Update dependencies

* **deps:** update [@oomol](https://github.com/oomol) packages to v0.23.2 ([#4](https://github.com/oomol/oocana-node/issues/4)) ([928964e](https://github.com/oomol/oocana-node/commit/928964ed2473676f2366d4dfa66e6c632cc6934e))

## [0.21.24](https://github.com/oomol/oocana-node/compare/@oomol/oocana-v0.21.23...@oomol/oocana-v0.21.24) (2025-03-08)


### Features

* update new flow field and update oocana-cli to 0.23.1 ([#1](https://github.com/oomol/oocana-node/issues/1)) ([b9fac6f](https://github.com/oomol/oocana-node/commit/b9fac6f729355692f4feef5b524deb798d7f171a))
